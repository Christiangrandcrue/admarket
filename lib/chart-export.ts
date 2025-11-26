/**
 * Export chart to image using html2canvas
 * Note: html2canvas should be loaded dynamically to avoid SSR issues
 */

export async function exportChartToImage(
  elementId: string,
  filename: string = 'chart'
): Promise<void> {
  try {
    // Dynamically import html2canvas to avoid SSR issues
    const html2canvas = (await import('html2canvas')).default

    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`)
    }

    // Generate canvas from element
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher quality
      logging: false,
      useCORS: true,
    })

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to create image blob')
      }

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}_${new Date().getTime()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Cleanup
      URL.revokeObjectURL(url)
    }, 'image/png')
  } catch (error) {
    console.error('Error exporting chart:', error)
    throw error
  }
}

/**
 * Export multiple charts as a single image
 */
export async function exportMultipleChartsToImage(
  elementIds: string[],
  filename: string = 'charts'
): Promise<void> {
  try {
    const html2canvas = (await import('html2canvas')).default

    // Create a container for all charts
    const container = document.createElement('div')
    container.style.backgroundColor = '#ffffff'
    container.style.padding = '20px'

    // Clone each chart element
    for (const elementId of elementIds) {
      const element = document.getElementById(elementId)
      if (element) {
        const clone = element.cloneNode(true) as HTMLElement
        container.appendChild(clone)
      }
    }

    // Temporarily add to DOM
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    document.body.appendChild(container)

    // Generate canvas
    const canvas = await html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
    })

    // Remove temporary container
    document.body.removeChild(container)

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to create image blob')
      }

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}_${new Date().getTime()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 'image/png')
  } catch (error) {
    console.error('Error exporting multiple charts:', error)
    throw error
  }
}

/**
 * Generate data based on selected period
 */
export function generatePeriodData(
  period: 'week' | 'month' | 'quarter' | 'year',
  dataGenerator: (periods: number) => any[]
) {
  const periodsCount = {
    week: 7, // 7 days
    month: 30, // 30 days or current month days
    quarter: 12, // 12 weeks
    year: 12, // 12 months
  }

  return dataGenerator(periodsCount[period])
}

/**
 * Format date labels based on period
 */
export function formatPeriodLabel(
  date: Date,
  period: 'week' | 'month' | 'quarter' | 'year'
): string {
  switch (period) {
    case 'week':
      return date.toLocaleDateString('ru-RU', { weekday: 'short' })
    case 'month':
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
    case 'quarter':
      return date.toLocaleDateString('ru-RU', { month: 'short' })
    case 'year':
      return date.toLocaleDateString('ru-RU', { month: 'short' })
    default:
      return date.toLocaleDateString('ru-RU')
  }
}
