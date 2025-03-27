"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  UserCog, 
  Loader2, 
  Grid, 
  List, 
  Shield,
  User,
  Mail,
  Calendar,
  Eye,
  Filter,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Image from 'next/image';

// Shadcn components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Define user interface based on your store
interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: "ADMIN" | "USER";
  profiles: Profile[];
  subscription: Subscription | null;
  createdAt?: Date;
}

interface Profile {
  id: string;
  name: string;
  isKids: boolean;
  avatar: string;
}

interface Subscription {
  tier: string;
  status: string;
  isSubscriptionActive: boolean;
}

const AdminUsersPage = () => {
  const router = useRouter();
  const { 
    user: currentUser,
    fetchUser,
    isLoading,
    error 
  } = useUserStore();
  
  // Local state
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'USER'>('ALL');
  const [subscriptionFilter, setSubscriptionFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  
  // Fetch users on component mount
  useEffect(() => {
    let isMounted = true;
    
    const loadUsers = async () => {
      try {
        await fetchUser();
        
        // For now, we'll use a mock array with the current user
        if (isMounted && currentUser) {
          setUsers([currentUser]);
        }
      } catch (error) {
        console.error("Failed to load users:", error);
      }
    };
    
    loadUsers();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array to run only once on mount

  // Filter users based on search term and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.firstName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    
    const matchesSubscription = 
      subscriptionFilter === 'ALL' || 
      (subscriptionFilter === 'ACTIVE' && user.subscription?.isSubscriptionActive) ||
      (subscriptionFilter === 'INACTIVE' && (!user.subscription || !user.subscription.isSubscriptionActive));
    
    return matchesSearch && matchesRole && matchesSubscription;
  });

  // Get user's full name or email if name is not available
  const getUserDisplayName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
      return user.firstName;
    } else {
      return user.email;
    }
  };

  // Get user's initials for avatar fallback
  const getUserInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    } else if (user.firstName) {
      return user.firstName[0].toUpperCase();
    } else {
      return user.email[0].toUpperCase();
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users Management</h1>
          <p className="text-muted-foreground">
            View and manage user accounts
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:min-w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem onClick={() => setRoleFilter('ALL')}>
                All Roles
                {roleFilter === 'ALL' && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleFilter('ADMIN')}>
                Administrators
                {roleFilter === 'ADMIN' && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleFilter('USER')}>
                Regular Users
                {roleFilter === 'USER' && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSubscriptionFilter('ALL')}>
                All Subscriptions
                {subscriptionFilter === 'ALL' && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSubscriptionFilter('ACTIVE')}>
                Active Subscriptions
                {subscriptionFilter === 'ACTIVE' && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSubscriptionFilter('INACTIVE')}>
                Inactive Subscriptions
                {subscriptionFilter === 'INACTIVE' && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="border rounded-md flex">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              className="rounded-none rounded-l-md"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" />
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              className="rounded-none rounded-r-md"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive">Error loading users: {error}</p>
          </CardContent>
        </Card>
      ) : filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <UserCog className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No users found matching your criteria</p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border">
                            <AvatarImage src={user.profiles?.[0]?.avatar} />
                            <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{getUserDisplayName(user)}</h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'outline'}>
                          {user.role}
                        </Badge>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{user.profiles?.length || 0} Profiles</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>
                            {user.subscription?.tier || 'No Subscription'}
                          </span>
                        </div>
                        {user.createdAt && (
                          <div className="flex items-center gap-1.5 col-span-2">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4">
                        <Badge 
                          variant={user.subscription?.isSubscriptionActive ? 'default' : 'secondary'}
                          className="w-full justify-center py-1.5"
                        >
                          {user.subscription?.isSubscriptionActive 
                            ? 'Active Subscription' 
                            : 'No Active Subscription'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Profiles</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profiles?.[0]?.avatar} />
                        <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{getUserDisplayName(user)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'outline'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.profiles?.length || 0}</TableCell>
                  <TableCell>{user.subscription?.tier || 'None'}</TableCell>
                  <TableCell>
                    {user.createdAt 
                      ? format(new Date(user.createdAt), 'MMM d, yyyy')
                      : 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.subscription?.isSubscriptionActive ? 'default' : 'secondary'}
                    >
                      {user.subscription?.isSubscriptionActive 
                        ? 'Active' 
                        : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default AdminUsersPage;
