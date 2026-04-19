const feed = document.getElementById('feed');

const chismes = [
  {
    texto: "👀 Dicen que alguien anda jugando doble...",
    tiempo: "Hace 2 min"
  },
  {
    texto: "🔥 Me contaron algo fuerte del Rodadero...",
    tiempo: "Hace 10 min"
  }
];

chismes.forEach(chisme => {
  const div = document.createElement('div');
  div.classList.add('post');

  div.innerHTML = `
    <div class="post-header">Anónimo</div>
    <div>${chisme.texto}</div>
    <div class="post-time">${chisme.tiempo}</div>
    <div class="post-actions">Me interesa · Comentar</div>
  `;

  feed.appendChild(div);
});
