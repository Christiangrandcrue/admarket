'use client'

import { Star, ThumbsUp, MessageCircle, Award, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { StarRating } from './star-rating'

interface RatingSummaryProps {
  rating: {
    overall_rating: number
    communication_rating: number
    quality_rating: number
    professionalism_rating: number
    timeliness_rating: number
    total_reviews: number
    positive_reviews: number
    neutral_reviews: number
    negative_reviews: number
    would_work_again_percentage: number
  }
}

export function RatingSummary({ rating }: RatingSummaryProps) {
  const ratingCategories = [
    {
      label: 'Коммуникация',
      value: rating.communication_rating,
      icon: MessageCircle,
      color: 'text-blue-600',
    },
    {
      label: 'Качество',
      value: rating.quality_rating,
      icon: Award,
      color: 'text-purple-600',
    },
    {
      label: 'Профессионализм',
      value: rating.professionalism_rating,
      icon: Star,
      color: 'text-yellow-600',
    },
    {
      label: 'Соблюдение сроков',
      value: rating.timeliness_rating,
      icon: Clock,
      color: 'text-green-600',
    },
  ]

  const ratingDistribution = [
    { stars: 5, count: Math.round(rating.positive_reviews * 0.6) },
    { stars: 4, count: Math.round(rating.positive_reviews * 0.4) },
    { stars: 3, count: rating.neutral_reviews },
    { stars: 2, count: Math.round(rating.negative_reviews * 0.4) },
    { stars: 1, count: Math.round(rating.negative_reviews * 0.6) },
  ]

  const maxCount = Math.max(...ratingDistribution.map((d) => d.count), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Рейтинг и отзывы</CardTitle>
      </CardHeader>
      <CardContent>
        {rating.total_reviews === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Star className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>Отзывов пока нет</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Rating */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-900">
                  {rating.overall_rating.toFixed(1)}
                </div>
                <StarRating
                  rating={rating.overall_rating}
                  size="lg"
                  showValue={false}
                  className="justify-center mt-2"
                />
                <div className="text-sm text-gray-600 mt-1">
                  {rating.total_reviews} {rating.total_reviews === 1 ? 'отзыв' : 'отзывов'}
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="flex-1 space-y-2">
                {ratingDistribution.map((item) => (
                  <div key={item.stars} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 w-8">{item.stars} ★</span>
                    <Progress
                      value={(item.count / maxCount) * 100}
                      className="h-2 flex-1"
                    />
                    <span className="text-sm text-gray-600 w-8 text-right">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Ratings */}
            <div className="grid grid-cols-2 gap-4">
              {ratingCategories.map((category) => {
                const Icon = category.icon
                return (
                  <div key={category.label} className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Icon className={`h-4 w-4 ${category.color}`} />
                      <span>{category.label}</span>
                    </div>
                    <StarRating rating={category.value} size="sm" />
                  </div>
                )
              })}
            </div>

            {/* Would Work Again */}
            {rating.would_work_again_percentage > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50">
                <ThumbsUp className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-green-900">
                    {rating.would_work_again_percentage.toFixed(0)}% рекомендуют к сотрудничеству
                  </div>
                  <div className="text-xs text-green-700">
                    На основе {rating.total_reviews} отзывов
                  </div>
                </div>
              </div>
            )}

            {/* Review Breakdown */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {rating.positive_reviews}
                </div>
                <div className="text-xs text-gray-600">Положительных</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {rating.neutral_reviews}
                </div>
                <div className="text-xs text-gray-600">Нейтральных</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {rating.negative_reviews}
                </div>
                <div className="text-xs text-gray-600">Отрицательных</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
