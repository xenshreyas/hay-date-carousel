
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Horse, Match } from '@/types';
import { MessageCircle, Heart } from 'lucide-react';

interface MatchWithHorse extends Match {
  horse1: Horse;
  horse2: Horse;
}

export const Matches = () => {
  const [matches, setMatches] = useState<MatchWithHorse[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      // Vulnerable: Complex query without proper access control
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          horse1:horses!matches_horse1_id_fkey(*),
          horse2:horses!matches_horse2_id_fkey(*)
        `)
        .eq('status', 'matched')
        .or(`horse1_id.eq.${user?.id},horse2_id.eq.${user?.id}`);

      if (error) {
        console.error('Error loading matches:', error);
        return;
      }

      setMatches(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOtherHorse = (match: MatchWithHorse): Horse => {
    return match.horse1_id === user?.id ? match.horse2 : match.horse1;
  };

  if (loading) {
    return <div className="p-6">Loading matches...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <Heart className="text-pink-500" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">Your Matches</h1>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💕</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No Matches Yet</h2>
            <p className="text-gray-600">Keep swiping to find your perfect horse match!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => {
              const otherHorse = getOtherHorse(match);
              return (
                <Card key={match.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    {otherHorse.image_url ? (
                      <img
                        src={otherHorse.image_url}
                        alt={otherHorse.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-4xl">🐎</div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold">{otherHorse.name}</h3>
                      <Badge variant="secondary">{otherHorse.age} years</Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{otherHorse.breed} • {otherHorse.color}</p>
                    <p className="text-gray-700 text-sm line-clamp-2 mb-4">
                      {otherHorse.description}
                    </p>
                    <div className="flex space-x-2">
                      <Button size="sm" className="flex items-center space-x-1 flex-1">
                        <MessageCircle size={14} />
                        <span>Message</span>
                      </Button>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      Matched on {new Date(match.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
