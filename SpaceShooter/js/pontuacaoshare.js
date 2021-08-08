  // Canvas e Context

  var canvas = document.getElementById('canvas_animacao');
  var context = canvas.getContext('2d');

  // Variáveis principais
  var imagens, animacao, teclado, colisor, nave, criadorInimigos;
  var totalImagens = 0, carregadas = 0;
  var musicaAcao;

  // Começa carregando as imagens e músicas
  carregarImagens();
  carregarMusicas();

  function carregarImagens() {
	// Objeto contendo os nomes das imagens
	imagens = {
		espaco:   'fundo-espaco.png', 
		estrelas: 'fundo-estrelas.png', 
		nuvens:   'fundo-nuvens.png', 
		nave:     'nave-spritesheet.png', 
		ovni:     'ovni.png',
		explosao: 'explosao.png'
	};
         
    // Carregar todas
	for (var i in imagens) {
		var img = new Image();
		img.src = 'img/' + imagens[i];
		img.onload = carregando;
		totalImagens++;
		// Substituir o nome pela imagem
		imagens[i] = img;
	}
  }
      
   function carregando() {
        context.save();
         
         // Fundo 
         context.drawImage(imagens.espaco, 0, 0, canvas.width,
                           canvas.height);
         
         // Texto "Carregando"
         context.fillStyle = 'white';
         context.strokeStyle = 'black';
         context.font = '50px sans-serif';
         context.fillText("Carregando...", 100, 200);
         context.strokeText("Carregando...", 100, 200);
         
         // Barra de loading
         carregadas++;
         var tamanhoTotal = 300;
         var tamanho = carregadas / totalImagens * tamanhoTotal;
         context.fillStyle = 'yellow';
         context.fillRect(100, 250, tamanho, 50);
         
         context.restore();         
         
         if (carregadas == totalImagens) {
            iniciarObjetos();
            mostrarLinkJogar();
         }
    }
      
  function iniciarObjetos() {
         // Objetos principais
         animacao = new Animacao(context);
         teclado = new Teclado(document);
         colisor = new Colisor();
         espaco = new Fundo(context, imagens.espaco);
         estrelas = new Fundo(context, imagens.estrelas);
         nuvens = new Fundo(context, imagens.nuvens);
         nave = new Nave(context, teclado, imagens.nave, 
                         imagens.explosao);
         painel = new Painel(context, nave);
         
         // Ligações entre objetos
         animacao.novoSprite(espaco);
         animacao.novoSprite(estrelas);
         animacao.novoSprite(nuvens);
         animacao.novoSprite(painel);
         animacao.novoSprite(nave);
         
         colisor.novoSprite(nave);
         animacao.novoProcessamento(colisor);
         
         configuracoesIniciais();
      }
      
      function configuracoesIniciais() {
         // Fundos
         espaco.velocidade = 60;
         estrelas.velocidade = 150;
         nuvens.velocidade = 500;
         
         // Nave
         nave.posicionar();
         nave.velocidade = 200;
         
         // Inimigos
         criacaoInimigos();
         
         // Game Over
         nave.acabaramVidas = function() {
            animacao.desligar();
            gameOver();
         }
         
         // Pontuação
         colisor.aoColidir = function(o1, o2) {
            // Tiro com Ovni
            if ( (o1 instanceof Tiro && o2 instanceof Ovni) ||
                 (o1 instanceof Ovni && o2 instanceof Tiro) )
               painel.pontuacao += 10;
         }
      }
      
      function criacaoInimigos() {
         criadorInimigos = {
            ultimoOvni: new Date().getTime(),
            
            processar: function() {
               var agora = new Date().getTime();
               var decorrido = agora - this.ultimoOvni;
               
               if (decorrido > 1000) {
                  novoOvni();
                  this.ultimoOvni = agora;
               }
            }
         };
         
         animacao.novoProcessamento(criadorInimigos);
      }
      
      function novoOvni() {
         var imgOvni = imagens.ovni;
         var ovni = new Ovni(context, imgOvni, imagens.explosao);

         // Mínimo: 500; máximo: 1000
         ovni.velocidade = 
            Math.floor( 500 + Math.random() * (1000 - 500 + 1) );
         
         // Mínimo: 0; máximo: largura do canvas - largura do ovni   
         ovni.x = 
            Math.floor(Math.random() * 
                       (canvas.width - imgOvni.width + 1) );
                  
         // Descontar a altura
         ovni.y = -imgOvni.height;
         
         animacao.novoSprite(ovni);
         colisor.novoSprite(ovni);
      }
      
      function pausarJogo() {
         if (animacao.ligado) {
            animacao.desligar();
            ativarTiro(false);
            context.save();
            context.fillStyle = 'white';
            context.strokeStyle = 'black';
            context.font = '50px sans-serif';
            context.fillText("Pausado", 160, 200);
            context.strokeText("Pausado", 160, 200);
            context.restore();
         }
         else {
            criadorInimigos.ultimoOvni = new Date().getTime();
            animacao.ligar();
            ativarTiro(true);
         }
      }
      
      function ativarTiro(ativar) {
         if (ativar) {
            teclado.disparou(ESPACO, function() {
               nave.atirar();
            });
         }
         else
            teclado.disparou(ESPACO, null);
      }
      
      function carregarMusicas() {
         musicaAcao = new Audio();
         musicaAcao.src = 'snd/musica-acao.mp3';
         musicaAcao.load();
         musicaAcao.volume = 0.8;
         musicaAcao.loop = true;
      }
      
      function mostrarLinkJogar() {
         document.getElementById('link_jogar').style.display =
            'block';
      }
      
      function iniciarJogo() {
         criadorInimigos.ultimoOvni = new Date().getTime();
         
         // Tiro
         ativarTiro(true);
         
         // Pausa
         teclado.disparou(ENTER, pausarJogo);
         
         document.getElementById('link_jogar').style.display =
            'none';
         document.getElementById('postar_pontuacao').style.display =
            'none';
         
         painel.pontuacao = 0;
         musicaAcao.play();
         animacao.ligar();
      }
      
      function gameOver() {
         // Tiro
         ativarTiro(false);
         
         // Pausa
         teclado.disparou(ENTER, null);
         
         // Parar a música e rebobinar
         musicaAcao.pause();
         musicaAcao.currentTime = 0.0;
         
         // Fundo
         context.drawImage(imagens.espaco, 0, 0, canvas.width,
                           canvas.height);
         
         // Texto "Game Over"
         context.save();
         context.fillStyle = 'white';
         context.strokeStyle = 'black';
         context.font = '70px sans-serif';
         context.fillText("GAME OVER", 40, 200);
         context.strokeText("GAME OVER", 40, 200);
         context.restore();
         
         // Volta o link "Jogar"
         mostrarLinkJogar();
         
         // Restaurar as condições da nave
         nave.vidasExtras = 3;
         nave.posicionar();
         animacao.novoSprite(nave);
         colisor.novoSprite(nave);
         
         // Tirar todos os inimigos da tela
         removerInimigos();
         
         // Link de postar pontuação
         document.getElementById('postar_pontuacao')
            .style.display = 'block';
      }
      
      function removerInimigos() {
         for (var i in animacao.sprites) {
            if (animacao.sprites[i] instanceof Ovni)
               animacao.excluirSprite(animacao.sprites[i]);
         }
      }
      
      function postarPontuacao() {
          // API de feed do Facebook
          FB.ui(
            {
             method: 'feed',
             name: 'Jogo de Nave',
             caption: 'Jogue e compartilhe com seus amigos!',
             description: (
                'Minha pontuacao foi: ' + painel.pontuacao
             ),
             link: 'http://gamecursos.com.br/jogo-nave'
            },
            function(response) {}
          );       
      }