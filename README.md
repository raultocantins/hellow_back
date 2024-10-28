[![en](https://img.shields.io/badge/lang-en-red.svg)](README.md)
[![pt-br](https://img.shields.io/badge/lang-pt--br-green.svg)](README.md)

### Primeira configuração

Antes de começar, você deve completar esta lista de verificação:

- [ ] Ter um servidor limpo rodando Ubuntu 20 ou mais recente
- [ ] Portas 80 e 443 disponíveis e não filtradas pelo firewall
- [ ] Um nome de host com DNS configurado apontando para o seu servidor

Após isso, basta fazer login no seu servidor e emitir o seguinte comando, substituindo os nomes de host que você já configurou e seu endereço de email:

```bash
curl -sSL get.ticke.tz | sudo bash -s app.exemplo.com nome@exemplo.com
```

Após alguns minutos, você terá o servidor rodando no nome que você deu para o host.

O login padrão é o endereço de email fornecido no comando de instalação e a senha padrão é `123456`, você deve alterá-la imediatamente.

### Atualização

A atualização é tão fácil quanto a instalação, você só precisa fazer login no seu servidor usando o mesmo nome de usuário que você usou na instalação e emitir o seguinte comando:

```bash
curl -sSL update.ticke.tz | sudo bash
```

Seu servidor ficará fora do ar e após alguns minutos ele estará rodando na última versão lançada.

### Inspecionar logs

Como todos os elementos estão rodando em containers, os logs devem ser verificados através do comando docker.

Você deve fazer login no seu servidor usando o mesmo usuário que você usou para a instalação.

Primeiro você precisa mover o diretório atual para a pasta de instalação:

```bash
cd ~/ticketz-docker-acme
```

Após isso, você pode obter um relatório completo de logs com o seguinte comando:

```bash
docker compose logs -t
```

Se você quiser "seguir" os logs em tempo real, basta adicionar um parâmetro `-f` a esse comando:

```bash
docker compose logs -t -f
```

## Rodando o projeto a partir do Código Fonte usando Docker:

Para a
instalação é necessário ter o Docker Community Edition e o cliente Git
instalados. O ideal é buscar a melhor forma de instalar estes recursos no
sistema operacional de sua preferência. [O guia oficial de instalação do
Docker pode ser encontrado aqui](https://docs.docker.com/engine/install/).

Em ambos os casos é necessário clonar o repositório, necessário então abrir
um terminal de comandos:

```bash
git clone https://github.com/allgood/ticketz.git
cd ticketz
```

## Rodando localmente

Por padrão a configuração está ajustada para executar o sistema apenas no
próprio computador. Para executar em uma rede local é necessário editar os
arquivos `.env-backend-local` e `.env-frontend-local` e alterar os endereços
de backend e frontend de `localhost` para o ip desejado, por exemplo
`192.168.0.10`

Para executar o sistema basta executar o comando abaixo:

```bash
docker compose -f docker-compose-local.yaml up -d
```

Na primeira execução o sistema vai inicializar os bancos de dados e tabelas,
e após alguns minutos o Ticketz estará acessível pela porta 3000

O usuário padrão é `admin@ticketz.host` e a senha padrão é `123456`

A aplicação irá se reiniciar automaticamente a cada reboot do servidor.

A execução pode ser interrompida com o comando:

```bash
docker compose -f docker-compose-local.yaml down
```

## Rodando e servindo na internet

Tendo um servidor acessível pela internet, é necessário ajustar dois nomes
de DNS a sua escolha, um para o backend e outro para o frontend, e também um
endereço de email para cadastro dos certificados, por exemplo:

- **backend:** api.ticketz.exemplo.com.br
- **frontend:** ticketz.exemplo.com.br
- **email:** ticketz@exemplo.com.br

É necessário editar os arquivos `.env-backend-acme` e `.env-frontend-acme`
definindo neles estes valores.

Se desejar utilizar reCAPTCHA na inscrição de empresas também é necessário
inserir as chaves secretas e de site nos arquivos de backend e frontend,
respectivamente.

Este guia presume que o terminal está aberto e logado com um usuário comum
que tem permissão para utilizar o comando `sudo` para executar comandos como
root.

Estando então na pasta raiz do projeto, executa-se o seguinte comando para
iniciar o serviço:

```bash
sudo docker compose -f docker-compose-acme.yaml up -d
```

Na primeira execução o Docker irá fazer a compilação do código e criação dos
conteiners, e após isso o ticketz vai inicializar os bancos de dados e
tabelas. Esta operação pode levar bastante tempo, depois disso o Ticketz
estará acessível pelo endereço fornecido para oo frontend.

O usuário padrão será o endereço de email fornecido na configuração do arquivo `.env-backend-acme` e a senha padrão é `123456`

A aplicação irá se reiniciar automaticamente a cada reboot do servidor.

Para encerrar o serviço utiliza-se o seguinte comando:

```bash
sudo docker compose -f docker-compose-acme.yaml down
```
