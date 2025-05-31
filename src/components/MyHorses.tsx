
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HorseCard } from './HorseCard';
import { Horse } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

export const MyHorses = () => {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingHorse, setEditingHorse] = useState<Horse | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    color: '',
    description: '',
    location: '',
    personality: '',
    image_url: ''
  });

  useEffect(() => {
    loadMyHorses();
  }, []);

  const loadMyHorses = async () => {
    try {
      const { data, error } = await supabase
        .from('horses')
        .select('*')
        .eq('owner_id', user?.id || '');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const horseData = {
      name: formData.name,
      breed: formData.breed,
      age: parseInt(formData.age),
      color: formData.color,
      description: formData.description,
      location: formData.location,
      personality: formData.personality.split(',').map(p => p.trim()).filter(Boolean),
      image_url: formData.image_url || null,
      owner_id: user?.id || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      if (editingHorse) {
        const { error } = await supabase
          .from('horses')
          .update({ ...horseData, updated_at: new Date().toISOString() })
          .eq('id', editingHorse.id);

        if (error) throw error;
        
        toast({
          title: "Horse Updated",
          description: "Your horse's profile has been updated successfully!",
        });
      } else {
        const { error } = await supabase
          .from('horses')
          .insert([horseData]);

        if (error) throw error;
        
        toast({
          title: "Horse Added",
          description: "Your horse has been added to the dating pool!",
        });
      }

      resetForm();
      loadMyHorses();
    } catch (error) {
      console.error('Error saving horse:', error);
      toast({
        title: "Error",
        description: "Failed to save horse. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (horse: Horse) => {
    setEditingHorse(horse);
    setFormData({
      name: horse.name,
      breed: horse.breed,
      age: horse.age.toString(),
      color: horse.color,
      description: horse.description,
      location: horse.location,
      personality: horse.personality.join(', '),
      image_url: horse.image_url || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (horseId: string) => {
    if (!confirm('Are you sure you want to delete this horse?')) return;

    try {
      const { error } = await supabase
        .from('horses')
        .delete()
        .eq('id', horseId);

      if (error) throw error;

      toast({
        title: "Horse Deleted",
        description: "Your horse has been removed from the dating pool.",
      });

      loadMyHorses();
    } catch (error) {
      console.error('Error deleting horse:', error);
      toast({
        title: "Error",
        description: "Failed to delete horse. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      breed: '',
      age: '',
      color: '',
      description: '',
      location: '',
      personality: '',
      image_url: ''
    });
    setShowForm(false);
    setEditingHorse(null);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Horses</h1>
          <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
            <Plus size={16} />
            <span>Add Horse</span>
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingHorse ? 'Edit Horse' : 'Add New Horse'}</CardTitle>
              <CardDescription>
                Fill in the details to add your horse to the dating pool
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="breed">Breed</Label>
                    <Input
                      id="breed"
                      value={formData.breed}
                      onChange={(e) => setFormData({...formData, breed: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image_url">Image URL (optional)</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                      placeholder="https://example.com/horse.jpg"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="personality">Personality Traits (comma separated)</Label>
                  <Input
                    id="personality"
                    value={formData.personality}
                    onChange={(e) => setFormData({...formData, personality: e.target.value})}
                    placeholder="Friendly, Energetic, Calm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit">
                    {editingHorse ? 'Update Horse' : 'Add Horse'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {horses.map((horse) => (
            <div key={horse.id} className="relative">
              <HorseCard horse={horse} onSwipe={() => {}} showActions={false} />
              <div className="flex justify-center space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(horse)}
                  className="flex items-center space-x-1"
                >
                  <Edit size={14} />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(horse.id)}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {horses.length === 0 && !showForm && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🐎</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No Horses Yet</h2>
            <p className="text-gray-600 mb-4">Add your first horse to start finding matches!</p>
            <Button onClick={() => setShowForm(true)}>Add Your First Horse</Button>
          </div>
        )}
      </div>
    </div>
  );
};
