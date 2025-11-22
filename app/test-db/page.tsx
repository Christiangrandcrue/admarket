export default async function TestDBPage() {
  // Тестируем через API route
  const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  let result = null
  let error = null

  try {
    const response = await fetch(`${apiUrl}/api/channels`, {
      cache: 'no-store'
    })
    result = await response.json()
  } catch (e: any) {
    error = e.message
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">Тест подключения к базе данных</h1>
        
        {/* Информация о подключении */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Конфигурация:</h2>
          <div className="space-y-2 font-mono text-sm">
            <p>
              <strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'НЕ УСТАНОВЛЕН'}
            </p>
            <p>
              <strong>Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...
            </p>
            <p>
              <strong>API URL:</strong> {apiUrl}/api/channels
            </p>
          </div>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="mb-8 rounded-lg bg-red-50 p-6">
            <h2 className="mb-4 text-xl font-semibold text-red-800">❌ Ошибка:</h2>
            <pre className="overflow-auto text-sm">{error}</pre>
          </div>
        )}

        {/* Результат API */}
        {result && (
          <div className="mb-8 rounded-lg bg-blue-50 p-6">
            <h2 className="mb-4 text-xl font-semibold text-blue-800">📡 Ответ API:</h2>
            <pre className="overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {/* Данные */}
        {result?.success && result?.channels && (
          <div className="rounded-lg bg-green-50 p-6">
            <h2 className="mb-4 text-xl font-semibold text-green-800">
              ✅ Найдено каналов: {result.count}
            </h2>
            <div className="space-y-4">
              {result.channels.map((channel: any) => (
                <div key={channel.id} className="rounded border border-green-200 bg-white p-4">
                  <h3 className="font-bold">{channel.title}</h3>
                  <p className="text-sm text-gray-600">{channel.handle}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Подписчики: {channel.metrics?.followers?.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Если нет данных */}
        {result && !result.success && (
          <div className="rounded-lg bg-yellow-50 p-6">
            <h2 className="mb-4 text-xl font-semibold text-yellow-800">
              ⚠️ Данные не найдены
            </h2>
            <p>Ошибка: {result.error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
