
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Settings, Shield } from 'lucide-react';

export const Profile = () => {
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    location: '',
    bio: '',
    profile_image: ''
  });
  const [loading, setLoading] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id || '')
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      setProfile({
        full_name: data.full_name || '',
        email: data.email || '',
        location: data.location || '',
        bio: data.bio || '',
        profile_image: data.profile_image || ''
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: profile.full_name,
          email: profile.email,
          location: profile.location,
          bio: profile.bio,
          profile_image: profile.profile_image,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id || '');

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully!",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Vulnerable: Exposing sensitive data in frontend
  const loadSensitiveData = async () => {
    try {
      // This would normally be a huge security risk - exposing all user data
      const { data, error } = await supabase
        .from('users')
        .select('*');

      if (error) {
        console.error('Error:', error);
        return;
      }

      console.log('All user data (SECURITY VULNERABILITY):', data);
      setShowSensitiveData(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <User className="text-blue-500" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your profile information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={profile.full_name}
                      onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile({...profile, location: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile_image">Profile Image URL</Label>
                    <Input
                      id="profile_image"
                      value={profile.profile_image}
                      onChange={(e) => setProfile({...profile, profile_image: e.target.value})}
                      placeholder="https://example.com/your-photo.jpg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings size={20} />
                  <span>Account Info</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Username</Label>
                  <p className="text-gray-700">{user?.username}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Member Since</Label>
                  <p className="text-gray-700">Today</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">User ID</Label>
                  <p className="text-gray-700 font-mono text-xs break-all">{user?.id}</p>
                </div>
              </CardContent>
            </Card>

            {/* Vulnerable: Admin panel with dangerous functionality */}
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-700">
                  <Shield size={20} />
                  <span>Admin Panel</span>
                </CardTitle>
                <CardDescription className="text-red-600">
                  Dangerous admin functions (SECURITY RISK!)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={loadSensitiveData}
                  className="w-full mb-2"
                >
                  Load All User Data (SQL Injection Risk)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Vulnerable: Exposing sensitive data in localStorage
                    const allData = {
                      users: localStorage.getItem('current_user'),
                      password: localStorage.getItem('user_password'),
                      sessionData: document.cookie
                    };
                    console.log('Exposed sensitive data:', allData);
                    alert('Sensitive data logged to console (check F12)');
                  }}
                  className="w-full"
                >
                  Expose Local Storage Data
                </Button>
                {showSensitiveData && (
                  <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded text-xs">
                    <strong>SECURITY BREACH:</strong> All user data has been logged to the console.
                    This demonstrates a serious data leak vulnerability!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
