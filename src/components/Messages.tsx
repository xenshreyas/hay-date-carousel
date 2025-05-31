
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Message, Match, Horse } from '@/types';
import { MessageCircle, Send } from 'lucide-react';

interface MessageWithUser extends Message {
  sender: {
    username: string;
  };
}

export const Messages = () => {
  const [matches, setMatches] = useState<(Match & { horse1: Horse; horse2: Horse })[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadMatches();
  }, []);

  useEffect(() => {
    if (selectedMatch) {
      loadMessages(selectedMatch);
    }
  }, [selectedMatch]);

  const loadMatches = async () => {
    try {
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
      if (data && data.length > 0) {
        setSelectedMatch(data[0].id);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (matchId: string) => {
    try {
      // Vulnerable: Direct query without proper validation
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(username)
        `)
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedMatch) return;

    try {
      // Vulnerable: No input sanitization - XSS risk
      const { error } = await supabase
        .from('messages')
        .insert([{
          match_id: selectedMatch,
          sender_id: user?.id || 0,
          content: newMessage, // Vulnerable to XSS attacks
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Error sending message:', error);
        return;
      }

      setNewMessage('');
      loadMessages(selectedMatch);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getOtherHorse = (match: Match & { horse1: Horse; horse2: Horse }): Horse => {
    return match.horse1_id === user?.id?.toString() ? match.horse2 : match.horse1;
  };

  if (loading) {
    return <div className="p-6">Loading messages...</div>;
  }

  if (matches.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <MessageCircle size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No Conversations</h2>
            <p className="text-gray-600">Match with other horses to start chatting!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto h-screen flex">
        {/* Matches Sidebar */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Conversations</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {matches.map((match) => {
              const otherHorse = getOtherHorse(match);
              return (
                <div
                  key={match.id}
                  onClick={() => setSelectedMatch(match.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedMatch === match.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {otherHorse.image_url ? (
                        <img
                          src={otherHorse.image_url}
                          alt={otherHorse.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-2xl">🐎</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{otherHorse.name}</h3>
                      <p className="text-sm text-gray-600">{otherHorse.breed}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {selectedMatch ? (
            <>
              <div className="p-4 bg-white border-b border-gray-200">
                <h3 className="text-lg font-semibold">
                  {getOtherHorse(matches.find(m => m.id === selectedMatch)!).name}
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_id === user?.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      {/* Vulnerable: Direct rendering without sanitization - XSS risk */}
                      <div dangerouslySetInnerHTML={{ __html: message.content }} />
                      <div className="text-xs opacity-70 mt-1">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-200">
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newMessage.trim()}>
                    <Send size={16} />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-600">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
