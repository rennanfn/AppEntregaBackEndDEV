# Sobre o Projeto
O AppEntrega, é um sistema que gerencia a entrega de itens para colaboradores de uma indústria. O sistema consiste em dois fronts que consultam o mesmo backend. 
O primeiro front é o gerenciador onde consulta a tabela de colaboradores e a partir daí o usuário gerenciador define qual item e a quantidade do item que o colaborador
pode retirar. O segundo front, faz a leitura do qrcode apresentado pelo colaborador no momento da entrega e partir da leitura o entregador consegue ver quais o itens 
estão liberados para a retirada do colaborador e assim faz a baixa do item confirmando a retirada. Após a retirada o sistema segue algumas regras que impossibilitam o
colaborador de fazer novas retiradas dentro do período estabelecido.

# Tecnologias Utilizadas
Node.js versão 18.14.2
Framework Express
