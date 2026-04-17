import ui from './ui.js'
import api from './api.js'

const pensamentosSet = new Set()
let mostrandoFavoritos = false
let btnFavoritos

async function adicionarChaveAoPensamento() {
    try {
        const pensamentos = await api.buscarPensamentos()
        pensamentos.forEach(pensamento => {
            const chavePensamento = `${pensamento.conteudo.trim().toLowerCase()}-${pensamento.autoria.trim().toLowerCase()}`
            pensamentosSet.add(chavePensamento)
        })
    } 
    catch (error) {
        alert('Erro ao adicionar chave ao pensamento')
        throw error
    }
}

function removerEspacos(string) {
    return string.replaceAll(/\s+/g, '')
}

const regexConteudo = /^[A-Za-zÀ-ÿ0-9\s.,!?]{5,}$/
const regexAutoria = /^[A-Za-zÀ-ÿ0-9]{3,25}$/

function validarConteudo(conteudo) {
    return regexConteudo.test(conteudo)
}

function validarAutoria(autoria) {
    return regexAutoria.test(autoria)
}

document.addEventListener('DOMContentLoaded', () => {
    ui.renderizarPensamentos()
    adicionarChaveAoPensamento()

    const formularioPensamento = document.getElementById('pensamento-form')
    const botaoCancelar = document.getElementById('botao-cancelar')
    const inputBusca = document.getElementById('campo-busca')
    btnFavoritos = document.querySelector('.fav')

    formularioPensamento.addEventListener('submit', manipularSubmissaoFormulario)
    botaoCancelar.addEventListener('click', manipularCancelamento)
    inputBusca.addEventListener('input', manipularBusca)
    btnFavoritos.addEventListener('click', manipularFavoritos)
})

async function manipularSubmissaoFormulario(event) {
    event.preventDefault()
    const id = document.getElementById('pensamento-id').value
    const conteudo = document.getElementById('pensamento-conteudo').value
    const autoria = document.getElementById('pensamento-autoria').value
    const data = document.getElementById('pensamento-data').value

    const conteudoSemEspaços = removerEspacos(conteudo)
    const autoriaSemEspaços = removerEspacos(autoria)

    if (!validarConteudo(conteudoSemEspaços)) {
        alert('Conteúdo com no mínimo 5 caractéres')
        return
    }

    if (!validarAutoria(autoriaSemEspaços)) {
        alert('Autoria com apenas letras, no mínimo 3 caractéres')
        return
    }

    if (!validarData(data)) {
        alert('Não é permitido o cadastro de datas futuras, selecione outra data')
        return
    }

    const chaveNovoPensamento = `${conteudo.trim().toLowerCase()}-${autoria.trim().toLowerCase()}`

    if (pensamentosSet.has(chaveNovoPensamento)) {
        alert('Esse pensamento já existe')
        return
    }

    try{
        if(id){
             await api.editarPensamento({id, conteudo, autoria, data })
        } else {
            await api.salvarPensamento({ conteudo, autoria, data })
        }
        ui.renderizarPensamentos()
    }
    catch (error) {
        alert('Erro ao salvar pensamento')
        throw error
    }
}

function manipularCancelamento() {
    ui.limparFormulario();
}

async function manipularBusca() {
    const termoBusca = document.getElementById('campo-busca').value
    try {
        const pensamentosFiltrados = await api.buscarPensamentoPorTermo(termoBusca)
        ui.renderizarPensamentos(pensamentosFiltrados)
    } 
    catch (error) {
        alert('Erro ao realizar busca')
        throw error
    }
}

function validarData(data){
    const dataAtual = new Date()
    const dataInserida = new Date(data)
    return dataInserida <= dataAtual
}

async function manipularFavoritos() {
    try {
        mostrandoFavoritos = !mostrandoFavoritos

        const pensamentos = await api.buscarPensamentos()
        if (mostrandoFavoritos) {
            const favoritos = pensamentos.filter(pensamento => pensamento.favorito)
            ui.renderizarPensamentos(favoritos)
            btnFavoritos.src = 'assets/imagens/icone-favorito_azul.png'
        } else {
            ui.renderizarPensamentos(pensamentos)
            btnFavoritos.src = 'assets/imagens/icone-favorito_outline-azul.png'
        }
    } catch (error) {
        alert('Erro ao carregar favoritos')
        throw error
    }
}