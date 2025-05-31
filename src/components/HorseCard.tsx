
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Horse } from '@/types';
import { Heart, X, MapPin, Calendar } from 'lucide-react';

interface HorseCardProps {
  horse: Horse;
  onSwipe: (action: 'like' | 'pass') => void;
  showActions?: boolean;
}

export const HorseCard = ({ horse, onSwipe, showActions = true }: HorseCardProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <Card className="w-full max-w-sm mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
      <div className="relative">
        <div className="h-80 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
          {horse.image_url && !imageError ? (
            <img
              src={horse.image_url}
              alt={horse.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="text-6xl">🐎</div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h3 className="text-white text-2xl font-bold">{horse.name}</h3>
          <div className="flex items-center text-white/90 text-sm mt-1">
            <Calendar size={14} className="mr-1" />
            <span>{horse.age} years old</span>
            <span className="mx-2">•</span>
            <span>{horse.breed}</span>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center text-gray-600">
            <MapPin size={14} className="mr-1" />
            <span className="text-sm">{horse.location}</span>
          </div>
          
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary">{horse.color}</Badge>
            {horse.personality.map((trait, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {trait}
              </Badge>
            ))}
          </div>
          
          <p className="text-gray-700 text-sm line-clamp-3">
            {horse.description}
          </p>
        </div>
        
        {showActions && (
          <div className="flex justify-center space-x-4 mt-6">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full w-14 h-14 p-0 border-red-300 hover:bg-red-50"
              onClick={() => onSwipe('pass')}
            >
              <X size={24} className="text-red-500" />
            </Button>
            <Button
              size="lg"
              className="rounded-full w-14 h-14 p-0 bg-pink-500 hover:bg-pink-600"
              onClick={() => onSwipe('like')}
            >
              <Heart size={24} className="text-white" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
