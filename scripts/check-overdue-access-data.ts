import { markOverdueAccessData } from '../src/lib/access-data-helpers'

async function runOverdueCheck() {
  try {
    console.log('Iniciando verificação de dados de acesso vencidos...')
    
    const overdueCount = await markOverdueAccessData()
    
    console.log(`✅ Verificação concluída. ${overdueCount} registros marcados como vencidos.`)
    
    if (overdueCount > 0) {
      console.log(`⚠️  ${overdueCount} administradores precisam ser notificados sobre prazos vencidos.`)
      // TODO: Implementar sistema de notificações via e-mail ou dashboard
    }
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro ao verificar dados vencidos:', error)
    process.exit(1)
  }
}

runOverdueCheck()
