
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string, role?: UserRole) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  createMasterUser: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(async () => {
            console.log('Fetching profile for user:', session.user.id);
            const { data: profile, error } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            console.log('Profile data:', profile, 'Error:', error);
            console.log('User role detected:', profile?.role);
            
            // Verificar se é admin e testar acesso a restaurantes
            if (profile?.role === 'admin') {
              console.log('Admin user detected, testing restaurant access...');
              const { data: testRestaurants, error: testError } = await supabase
                .from('restaurants')
                .select('id, name')
                .limit(5);
              
              console.log('Test restaurant query result:', testRestaurants?.length || 0, 'restaurants found');
              if (testError) {
                console.error('Test restaurant query error:', testError);
              }
            }
            
            setUserProfile(profile);
          }, 0);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('Attempting to sign in with:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    console.log('Sign in result:', { data, error });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole = 'restaurant_owner') => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name,
          role
        }
      }
    });
    return { error };
  };

  const createMasterUser = async () => {
    console.log('Creating master user...');
    const { error } = await supabase.auth.signUp({
      email: 'master@admin.com',
      password: 'master123',
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          name: 'Master Admin',
          role: 'admin'
        }
      }
    });

    console.log('Master user creation result:', error);

    if (!error) {
      // Atualizar o perfil existente com o ID correto
      const { data: authUser } = await supabase.auth.getUser();
      console.log('Auth user after creation:', authUser.user?.id);
      if (authUser.user) {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ id: authUser.user.id })
          .eq('id', '00000000-0000-0000-0000-000000000001');
        
        console.log('Profile update result:', updateError);
      }
    }

    return { error };
  };

  const signOut = async () => {
    console.log('Signing out...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
    } else {
      console.log('Signed out successfully');
      setUser(null);
      setSession(null);
      setUserProfile(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      userProfile,
      loading,
      signIn,
      signUp,
      signOut,
      createMasterUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
