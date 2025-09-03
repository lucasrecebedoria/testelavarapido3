import { auth, onAuthStateChanged, colRelatoriosMensais, query, where, getDocs } from './firebase.js';

onAuthStateChanged(auth, (user)=>{ if(!user) location.href='index.html'; });

function prefixBadgeHtml(prefix){
  const n = parseInt(prefix,10);
  let cls='prefix-default';
  if(n>=55001 && n<=55184){ cls='prefix-green-flag'; }
  else if(n>=55185 && n<=55363){ cls='prefix-red'; }
  else if(n>=55364 && n<=55559){ cls='prefix-blue'; }
  else if(n>=55900){ cls='prefix-purple'; }
  return `<span class="prefix-badge ${cls}">${prefix}</span>`;
}

function toBR(dateStr){
  if(!dateStr) return '';
  const p = dateStr.split('-'); 
  return `${p[2]}/${p[1]}/${p[0]}`;
}

async function loadMonthly(){
  const el = document.getElementById('mesInput');
  if(!el.value) el.value = new Date().toISOString().slice(0,7);

  const prefixFilter = document.getElementById('prefixInput')?.value?.trim();

  const [yy,mm] = el.value.split('-');
  const q = query(colRelatoriosMensais, where('mes','==', `${yy}-${mm}`));
  const qs = await getDocs(q);

  const dados = [];
  qs.forEach(doc=>{
    dados.push(doc.data());
  });

  renderMonthly(dados);

  // contar lavagens do prefixo pesquisado
  contarLavagensPrefixo(dados, prefixFilter);
}

function contarLavagensPrefixo(dados, prefixFilter){
  if(!prefixFilter) {
    document.getElementById("resumoPrefixo").innerHTML = "";
    return;
  }
  let count = 0;
  dados.forEach(d=>{
    if(d.prefixo && d.prefixo.toString().startsWith(prefixFilter)){
      count++;
    }
  });
  const resumo = document.getElementById("resumoPrefixo");
  if(resumo){
    resumo.innerHTML = "Prefixo " + prefixFilter + " foi lavado " + count + " vezes neste mês.";
  }
}

function renderMonthly(dados){
  const tbody = document.querySelector('#tabelaMensal tbody');
  tbody.innerHTML = '';

  dados.forEach(d=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${prefixBadgeHtml(d.prefixo)}</td>
      <td>${d.qtdLavagens || 0}</td>
      <td>${(d.dias||[]).map(toBR).join(', ')}</td>
    `;
    tbody.appendChild(tr);
  });
}

// carregar sempre que o mês ou prefixo mudar
document.getElementById('mesInput').addEventListener('change', loadMonthly);
document.getElementById('prefixInput').addEventListener('input', loadMonthly);

// inicialização
loadMonthly();
