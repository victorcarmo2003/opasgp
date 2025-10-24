// Dados de motivos organizados por categoria
const MOTIVOS_POR_CATEGORIA = {
  'suporte': [
    { id: '672d1577911f877625a59248', text: 'Sem conexão', description: 'Cliente sem acesso à internet' },
    { id: '672d15bfa72e6a3e1fed9358', text: 'Lentidão', description: 'Cliente com conexão lenta' },
    { id: '672d15b1911f877625a5925d', text: 'Renegociação', description: 'Cliente solicita renegociação de plano' },
    { id: '68500fa18659ac8e64dc1c36', text: 'Equipamento danificado', description: 'Equipamento do cliente com defeito' },
    { id: '68271c5a534a14b50fdc8d74', text: 'Troca de Senha', description: 'Cliente precisa alterar senha do WiFi' },
    { id: '68279cd47a748ac1670c20a0', text: 'Liberação 48h', description: 'Cliente solicita liberação temporária' },
    { id: '688dec3acfd5c371592a29b1', text: 'Manutenção programada', description: 'Manutenção programada na região' },
    { id: '687ed3cecfd5c3715916945a', text: 'Manutenção Programada', description: 'Manutenção programada na região' },
    { id: '68e66b632a298ec657a2bd66', text: 'Teste', description: 'Teste de conexão ou equipamento' }
  ],
  'comercial': [
    { id: '672d1584a72e6a3e1fed933f', text: 'Contratar planos', description: 'Cliente interessado em novos planos' },
    { id: '681b7503a9942129afebf5e5', text: 'Troca de plano', description: 'Cliente quer alterar plano atual' },
    { id: '681b72324997a1715379eddb', text: 'Troca de titularidade', description: 'Transferência de titularidade do serviço' },
    { id: '681b724ec5ff55a9687c8f5d', text: 'Troca de vencimento', description: 'Cliente solicita mudança de data de vencimento' },
    { id: '681b7214c5ff55a9687c8f46', text: 'Mudança de endereço', description: 'Cliente mudando de endereço' },
    { id: '6830b5adf95e6720a21084cc', text: 'Venda', description: 'Oportunidade de venda de serviços' },
    { id: '68431c177a748ac16730391d', text: 'Anúncio Instagram', description: 'Cliente veio por anúncio no Instagram' },
    { id: '68f6781bab639fd3ac17eb84', text: 'Campanha Upgrade', description: 'Cliente interessado em upgrade de plano' },
    { id: '68f64579ab639fd3ac17107a', text: 'Promoção Santo Antônio', description: 'Cliente interessado na promoção' }
  ],
  'financeiro': [
    { id: '672d159fa72e6a3e1fed9348', text: 'Boletos em atraso', description: 'Cliente com boletos em aberto' },
    { id: '6827267ef95e6720a2cf0b2a', text: 'Segunda via de boleto', description: 'Cliente solicita segunda via do boleto' },
    { id: '68279cc27a748ac1670c2083', text: 'Envio de Comprovante', description: 'Cliente solicita comprovante de pagamento' },
    { id: '672d1544a72e6a3e1fed931e', text: 'Nota fiscal', description: 'Cliente solicita nota fiscal' },
    { id: '682727ae7a748ac1670ad861', text: 'Desconto na Mensalidade', description: 'Cliente solicita desconto na mensalidade' },
    { id: '684b1f14d2065d75abdd9cbb', text: 'Negociação CTO Cheia', description: 'Cliente negocia CTO cheia' }
  ],
  'agendamento': [
    { id: '6827317cd2065d75abafaff6', text: 'Verificação de Agendamento', description: 'Verificar agendamento existente' },
    { id: '682731a98659ac8e64a7e175', text: 'Inviabilidade', description: 'Cliente informa inviabilidade técnica' }
  ],
  'cancelamento': [
    { id: '682738618659ac8e64a7f7d8', text: 'Cancelamento', description: 'Cliente solicita cancelamento do serviço' },
    { id: '6720d586a72e6a3e1fed86e4', text: 'Cancelar Planos e serviços', description: 'Cliente quer cancelar planos e serviços' }
  ]
};

// Mapeamento de categorias para departamentos
const CATEGORIA_PARA_DEPARTAMENTO = {
  'suporte': '5bf73d1d186f7d2b0d647a61', // Suporte Técnico
  'comercial': '5bf73d1d186f7d2b0d647a60', // Comercial
  'financeiro': '5d1624085e74a002308aa25e', // Financeiro
  'agendamento': '5d1623f35e74a002308aa25d', // Agendamentos
  'cancelamento': '5d1629315e74a002308aa262' // Cancelamento
};

// Configurações de categorias para exibição
const CATEGORIAS_CONFIG = [
  { value: 'suporte', text: 'Suporte Técnico' },
  { value: 'comercial', text: 'Comercial' },
  { value: 'financeiro', text: 'Financeiro' },
  { value: 'agendamento', text: 'Agendamento' },
  { value: 'cancelamento', text: 'Cancelamento' }
];

// Exportar dados
if (typeof window !== 'undefined') {
  window.FastTransferData = {
    MOTIVOS_POR_CATEGORIA,
    CATEGORIA_PARA_DEPARTAMENTO,
    CATEGORIAS_CONFIG
  };
}
