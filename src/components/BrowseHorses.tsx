
import { useState, useEffect } from 'react';
import { HorseCard } from './HorseCard';
import { Horse } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export const BrowseHorses = () => {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadHorses();
  }, []);

  const loadHorses = async () => {
    try {
      // Vulnerable: No proper access control
      const { data, error } = await supabase
        .from('horses')
        .select('*')
        .neq('owner_id', user?.id || '')
        .limit(20);

      if (error) {
        console.error('Error loading horses:', error);
        return;
      }

      setHorses(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (action: 'like' | 'pass') => {
    const currentHorse = horses[currentIndex];
    if (!currentHorse || !user) return;

    try {
      // Record the swipe action
      const { error } = await supabase
        .from('swipe_actions')
        .insert([{
          swiper_horse_id: user.id, // Vulnerable: Using user ID instead of horse ID
          swiped_horse_id: currentHorse.id,
          action,
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Error recording swipe:', error);
      }

      // Check for matches if it's a like
      if (action === 'like') {
        // Vulnerable: Direct query without proper validation
        const { data: matchData } = await supabase
          .from('swipe_actions')
          .select('*')
          .eq('swiper_horse_id', currentHorse.id)
          .eq('swiped_horse_id', user.id)
          .eq('action', 'like')
          .single();

        if (matchData) {
          // It's a match!
          await supabase
            .from('matches')
            .insert([{
              horse1_id: user.id,
              horse2_id: currentHorse.id,
              status: 'matched',
              created_at: new Date().toISOString()
            }]);

          toast({
            title: "🎉 It's a Match!",
            description: `You and ${currentHorse.name} are a perfect match!`,
          });
        } else {
          toast({
            title: action === 'like' ? "💕 Liked!" : "👋 Passed",
            description: action === 'like' ? `You liked ${currentHorse.name}` : `You passed on ${currentHorse.name}`,
          });
        }
      }

      // Move to next horse
      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('Swipe error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="w-full max-w-sm">
          <Skeleton className="h-80 w-full rounded-t-2xl" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const currentHorse = horses[currentIndex];

  if (!currentHorse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🐎</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">No More Horses!</h2>
          <p className="text-gray-600">Check back later for more potential matches.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-sm">
        <HorseCard horse={currentHorse} onSwipe={handleSwipe} />
        <div className="text-center mt-4 text-gray-600">
          {currentIndex + 1} of {horses.length} horses
        </div>
      </div>
    </div>
  );
};
