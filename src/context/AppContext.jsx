import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

const AppContext = createContext();

const initialUsers = {
  admin: { username: 'admin', password: 'admin123', role: 'Super Admin (Advocate)', name: 'Adv. Karan Sharma', securityAnswer: 'delhi', email: 'karan.sharma@lexjuris.in', phone: '+91 98101 23456', licenceNumber: 'BAR/DL/2018/04821', licenceImageUrl: '' },
  accountant: { username: 'accountant', password: 'accountant123', role: 'Accountant', name: 'Neelam Sen', securityAnswer: 'bangalore', email: 'neelam.sen@lexjuris.in', phone: '+91 99203 87654', licenceNumber: 'N/A', licenceImageUrl: '' }
};

const getTodayDateString = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const initialClients = [
  { id: 'c1', name: 'Aarav Mehta', email: 'aarav@gmail.com', phone: '+91 98765 43210', address: 'Connaught Place, New Delhi' },
  { id: 'c2', name: 'Priya Patel', email: 'priya@yahoo.com', phone: '+91 87654 32109', address: 'Andheri West, Mumbai' },
  { id: 'c3', name: 'Vikram Singh', email: 'vikram@outlook.com', phone: '+91 76543 21098', address: 'Salt Lake, Kolkata' },
  { id: 'c4', name: 'Ananya Iyer', email: 'ananya@gmail.com', phone: '+91 65432 10987', address: 'Indiranagar, Bangalore' },
  { id: 'c5', name: 'Kabir Kapoor', email: 'kabir@kapoor.com', phone: '+91 99887 76655', address: 'Bandra, Mumbai' },
  { id: 'c6', name: 'Sneha Reddy', email: 'sneha@reddy.com', phone: '+91 88776 65544', address: 'Gachibowli, Hyderabad' },
  { id: 'c7', name: 'Devendra Joshi', email: 'dev@joshi.org', phone: '+91 77665 54433', address: 'C-Scheme, Jaipur' }
];

const initialCases = [
  { id: 'case1', caseNumber: 'SC/2026/1024', title: 'Mehta vs. Tech Solutions', clientId: 'c1', clientName: 'Aarav Mehta', status: 'active', court: 'Supreme Court of India', type: 'Civil', date: '2026-01-15' },
  { id: 'case2', caseNumber: 'HC/2025/4412', title: 'Priya Patel Property Dispute', clientId: 'c2', clientName: 'Priya Patel', status: 'active', court: 'Bombay High Court', type: 'Property', date: '2025-11-08' },
  { id: 'case3', caseNumber: 'DC/2024/0987', title: 'Vikram Singh Labor Case', clientId: 'c3', clientName: 'Vikram Singh', status: 'closed', court: 'Delhi District Court', type: 'Labor', date: '2024-09-22' },
  { id: 'case4', caseNumber: 'HC/2026/1209', title: 'Ananya Iyer Contract Dispute', clientId: 'c4', clientName: 'Ananya Iyer', status: 'pending', court: 'Karnataka High Court', type: 'Commercial', date: '2026-02-10' },
  { id: 'case5', caseNumber: 'SC/2025/3089', title: 'Kabir Kapoor Criminal Appeal', clientId: 'c5', clientName: 'Kabir Kapoor', status: 'active', court: 'Supreme Court of India', type: 'Criminal', date: '2025-07-30' },
  { id: 'case6', caseNumber: 'DC/2025/5512', title: 'Sneha Reddy Divorce Settlement', clientId: 'c6', clientName: 'Sneha Reddy', status: 'closed', court: 'Family Court, Hyderabad', type: 'Family', date: '2025-03-18' },
  { id: 'case7', caseNumber: 'HC/2026/0441', title: 'Joshi Tax Evading Appeal', clientId: 'c7', clientName: 'Devendra Joshi', status: 'pending', court: 'Rajasthan High Court', type: 'Taxation', date: '2026-04-05' },
  { id: 'case8', caseNumber: 'SC/2026/0012', title: 'State vs. Kapoor', clientId: 'c5', clientName: 'Kabir Kapoor', status: 'active', court: 'Supreme Court of India', type: 'Criminal', date: '2026-01-02' },
  { id: 'case9', caseNumber: 'HC/2026/9931', title: 'Reddy Builders Contract Review', clientId: 'c6', clientName: 'Sneha Reddy', status: 'active', court: 'Telangana High Court', type: 'Commercial', date: '2026-05-14' }
];

const initialHearings = [
  { id: 'h1', caseId: 'case1', caseName: 'Mehta vs. Tech Solutions', date: getTodayDateString(0), time: '10:30 AM', room: 'Courtroom 3', judge: 'Justice D.Y. Chandrachud', status: 'scheduled' },
  { id: 'h2', caseId: 'case2', caseName: 'Priya Patel Property Dispute', date: getTodayDateString(0), time: '02:15 PM', room: 'Courtroom 12', judge: 'Justice S.J. Kathawalla', status: 'scheduled' },
  { id: 'h3', caseId: 'case5', caseName: 'Kabir Kapoor Criminal Appeal', date: getTodayDateString(1), time: '11:00 AM', room: 'Courtroom 1', judge: 'Justice A.S. Oka', status: 'scheduled' },
  { id: 'h4', caseId: 'case4', caseName: 'Ananya Iyer Contract Dispute', date: getTodayDateString(3), time: '12:30 PM', room: 'Courtroom 7', judge: 'Justice P.S. Dinesh Kumar', status: 'scheduled' },
  { id: 'h5', caseId: 'case7', caseName: 'Joshi Tax Evading Appeal', date: getTodayDateString(7), time: '03:45 PM', room: 'Courtroom 4', judge: 'Justice S. Mehta', status: 'scheduled' }
];

const initialPayments = [
  // Credits
  { id: 'p1', clientName: 'Aarav Mehta', amount: 75000, type: 'credit', category: 'Retainer Fee', date: '2026-06-02', status: 'completed' },
  { id: 'p2', clientName: 'Priya Patel', amount: 50000, type: 'credit', category: 'Consultation Fee', date: '2026-06-05', status: 'completed' },
  { id: 'p3', clientName: 'Kabir Kapoor', amount: 120000, type: 'credit', category: 'Hearing Appearance Fee', date: '2026-06-12', status: 'completed' },
  { id: 'p4', clientName: 'Ananya Iyer', amount: 45000, type: 'credit', category: 'Drafting Charges', date: '2026-06-15', status: 'pending' },
  { id: 'p5', clientName: 'Devendra Joshi', amount: 15000, type: 'credit', category: 'Consultation Fee', date: '2026-06-18', status: 'pending' },
  
  // Debits
  { id: 'p6', clientName: 'Office Rent Ltd', amount: 35000, type: 'debit', category: 'Rent', date: '2026-06-01', status: 'completed' },
  { id: 'p7', clientName: 'LexisNexis India', amount: 12000, type: 'debit', category: 'Research Subscription', date: '2026-06-04', status: 'completed' },
  { id: 'p8', clientName: 'Local Transport & Travel', amount: 8000, type: 'debit', category: 'Travel Allowance', date: '2026-06-10', status: 'completed' },
  { id: 'p9', clientName: 'Stationery Depot', amount: 5000, type: 'debit', category: 'Office Stationery', date: '2026-06-14', status: 'completed' }
];

const initialActivities = [
  { id: 'act1', text: 'Hearing scheduled for Mehta vs. Tech Solutions today', time: '10 mins ago', type: 'hearing' },
  { id: 'act2', text: 'Payment of ₹1,20,000 received from Kabir Kapoor', time: '2 hours ago', type: 'payment' },
  { id: 'act3', text: 'Case SC/2026/0012 State vs. Kapoor created successfully', time: '1 day ago', type: 'case' },
  { id: 'act4', text: 'Client Devendra Joshi registered in the system', time: '1 day ago', type: 'client' },
  { id: 'act5', text: 'Labor Case DC/2024/0987 marked as Closed', time: '2 days ago', type: 'case' },
  { id: 'act6', text: 'Rent Payment of ₹35,000 processed', time: '3 days ago', type: 'payment' }
];

export const AppProvider = ({ children }) => {
  // Authentication & Settings
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('adv_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [usersList, setUsersList] = useState(() => {
    const saved = localStorage.getItem('adv_users_list');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('adv_theme');
    return saved || 'dark';
  });

  // Supabase Auth State Synchronization
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Get current session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              setCurrentUser({
                id: session.user.id,
                username: session.user.email,
                email: session.user.email,
                role: profile.role || 'Advocate',
                name: profile.name,
                phone: profile.phone_number || '',
                licenceImageUrl: profile.licence_image_url || '',
                licenceNumber: 'N/A'
              });
            }
          });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setCurrentUser({
            id: session.user.id,
            username: session.user.email,
            email: session.user.email,
            role: profile.role || 'Advocate',
            name: profile.name,
            phone: profile.phone_number || '',
            licenceImageUrl: profile.licence_image_url || '',
            licenceNumber: 'N/A'
          });
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Business Entities State
  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem('adv_clients');
    return saved ? JSON.parse(saved) : initialClients;
  });

  const [cases, setCases] = useState(() => {
    const saved = localStorage.getItem('adv_cases');
    return saved ? JSON.parse(saved) : initialCases;
  });

  const [hearings, setHearings] = useState(() => {
    const saved = localStorage.getItem('adv_hearings');
    return saved ? JSON.parse(saved) : initialHearings;
  });

  const [payments, setPayments] = useState(() => {
    const saved = localStorage.getItem('adv_payments');
    return saved ? JSON.parse(saved) : initialPayments;
  });

  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem('adv_activities');
    return saved ? JSON.parse(saved) : initialActivities;
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('adv_current_user', currentUser ? JSON.stringify(currentUser) : '');
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('adv_users_list', JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    localStorage.setItem('adv_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('adv_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('adv_cases', JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem('adv_hearings', JSON.stringify(hearings));
  }, [hearings]);

  useEffect(() => {
    localStorage.setItem('adv_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('adv_activities', JSON.stringify(activities));
  }, [activities]);

  // Auth Operations
  // Auth Operations
  const signUp = async (name, email, password, phone, licenceImageFile) => {
    if (isSupabaseConfigured) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;
        const userId = authData.user?.id;
        if (!userId) throw new Error('Sign up failed: No user ID returned.');

        let licenceImageUrl = '';
        if (licenceImageFile) {
          const fileExt = licenceImageFile.name.split('.').pop();
          const fileName = `${userId}-${Date.now()}.${fileExt}`;
          const filePath = `licence_${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('licences')
            .upload(filePath, licenceImageFile);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('licences')
            .getPublicUrl(filePath);

          licenceImageUrl = publicUrl;
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            name,
            email,
            phone_number: phone,
            licence_image_url: licenceImageUrl,
            role: 'Advocate'
          });

        if (profileError) throw profileError;

        return { success: true, message: 'Account registered successfully!' };
      } catch (error) {
        return { success: false, message: error.message };
      }
    } else {
      // Local Mock fallback
      try {
        const username = email.toLowerCase().trim();
        if (usersList[username]) {
          return { success: false, message: 'An account with this email already exists.' };
        }

        let licenceImageUrl = '';
        if (licenceImageFile) {
          licenceImageUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(licenceImageFile);
          });
        }

        const newUserObj = {
          username,
          email,
          password,
          role: 'Advocate',
          name,
          phone,
          licenceNumber: 'N/A',
          licenceImageUrl,
          securityAnswer: 'delhi'
        };

        setUsersList(prev => ({
          ...prev,
          [username]: newUserObj
        }));

        setCurrentUser(newUserObj);
        addActivity(`New Advocate account registered: ${name}`, 'auth');
        return { success: true };
      } catch (err) {
        return { success: false, message: 'Failed to process licence image: ' + err.message };
      }
    }
  };

  const login = async (emailOrUsername, password) => {
    const input = emailOrUsername.toLowerCase().trim();
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: input,
          password
        });
        if (error) throw error;
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) throw profileError;
        
        const userSession = {
          id: data.user.id,
          username: data.user.email,
          email: data.user.email,
          role: profile.role || 'Advocate',
          name: profile.name,
          phone: profile.phone_number || '',
          licenceImageUrl: profile.licence_image_url || '',
          licenceNumber: 'N/A'
        };
        setCurrentUser(userSession);
        addActivity(`User ${profile.name} logged in`, 'auth');
        return { success: true };
      } catch (error) {
        return { success: false, message: error.message };
      }
    } else {
      const matchedUser = Object.values(usersList).find(
        u => u.username?.toLowerCase() === input || u.email?.toLowerCase() === input
      );

      if (matchedUser && matchedUser.password === password) {
        setCurrentUser(matchedUser);
        addActivity(`User ${matchedUser.name} logged in`, 'auth');
        return { success: true };
      }
      return { success: false, message: 'Invalid email/username or password' };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    if (currentUser) {
      addActivity(`User ${currentUser.name} logged out`, 'auth');
    }
    setCurrentUser(null);
  };

  const changePassword = async (oldPassword, newPassword) => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });
        if (error) throw error;
        addActivity(`${currentUser.name} successfully changed their password`, 'auth');
        return { success: true };
      } catch (error) {
        return { success: false, message: error.message };
      }
    } else {
      if (!currentUser) return { success: false, message: 'Not logged in' };
      const username = currentUser.username.toLowerCase();
      const activeUserData = usersList[username];
      
      if (activeUserData.password !== oldPassword) {
        return { success: false, message: 'Incorrect old password' };
      }

      setUsersList(prev => ({
        ...prev,
        [username]: {
          ...prev[username],
          password: newPassword
        }
      }));
      setCurrentUser(prev => ({ ...prev, password: newPassword }));
      addActivity(`${currentUser.name} successfully changed their password`, 'auth');
      return { success: true };
    }
  };

  const updateProfile = async (name, phone, licenceImageFile) => {
    if (!currentUser) return { success: false, message: 'Not logged in' };

    if (isSupabaseConfigured) {
      try {
        let licenceImageUrl = currentUser.licenceImageUrl || '';

        if (licenceImageFile instanceof File) {
          const fileExt = licenceImageFile.name.split('.').pop();
          const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
          const filePath = `licence_${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('licences')
            .upload(filePath, licenceImageFile);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('licences')
            .getPublicUrl(filePath);

          licenceImageUrl = publicUrl;
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            name,
            phone_number: phone,
            licence_image_url: licenceImageUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentUser.id);

        if (updateError) throw updateError;

        setCurrentUser(prev => ({
          ...prev,
          name,
          phone,
          licenceImageUrl
        }));

        addActivity(`${name} updated their profile info`, 'auth');
        return { success: true };
      } catch (error) {
        return { success: false, message: error.message };
      }
    } else {
      try {
        const username = currentUser.username.toLowerCase();
        let licenceImageUrl = currentUser.licenceImageUrl || '';

        if (licenceImageFile instanceof File) {
          licenceImageUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(licenceImageFile);
          });
        }

        setUsersList(prev => ({
          ...prev,
          [username]: {
            ...prev[username],
            name,
            phone,
            licenceImageUrl
          }
        }));

        setCurrentUser(prev => ({
          ...prev,
          name,
          phone,
          licenceImageUrl
        }));

        addActivity(`${name} updated their profile info`, 'auth');
        return { success: true };
      } catch (err) {
        return { success: false, message: 'Failed to process licence image: ' + err.message };
      }
    }
  };

  const forgotPassword = (username, securityAnswer, newPassword) => {
    const normalizedUsername = username.toLowerCase().trim();
    const userAccount = usersList[normalizedUsername];
    if (!userAccount) {
      return { success: false, message: 'Username not found' };
    }

    if (userAccount.securityAnswer.toLowerCase() !== securityAnswer.toLowerCase().trim()) {
      return { success: false, message: 'Incorrect security answer' };
    }

    setUsersList(prev => ({
      ...prev,
      [normalizedUsername]: {
        ...prev[normalizedUsername],
        password: newPassword
      }
    }));
    addActivity(`Password recovered and reset for user: ${userAccount.name}`, 'auth');
    return { success: true };
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Activity logger helper
  const addActivity = (text, type = 'general') => {
    const newAct = {
      id: 'act_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      text,
      time: 'Just now',
      type
    };
    setActivities(prev => [newAct, ...prev].slice(0, 50)); // cap at 50
  };

  // CRUD Operations
  const addClient = (name, email, phone, address) => {
    const newClient = {
      id: 'c_' + Date.now(),
      name,
      email,
      phone,
      address
    };
    setClients(prev => [...prev, newClient]);
    addActivity(`New client registered: ${name}`, 'client');
  };

  const deleteClient = (id) => {
    const target = clients.find(c => c.id === id);
    if (!target) return;
    setClients(prev => prev.filter(c => c.id !== id));
    addActivity(`Client removed: ${target.name}`, 'client');
  };

  const addCase = (caseNumber, title, clientId, court, type, date) => {
    const client = clients.find(c => c.id === clientId);
    const newCase = {
      id: 'case_' + Date.now(),
      caseNumber,
      title,
      clientId,
      clientName: client ? client.name : 'Unknown Client',
      status: 'active',
      court,
      type,
      date: date || new Date().toISOString().split('T')[0]
    };
    setCases(prev => [...prev, newCase]);
    addActivity(`New case created: ${caseNumber} - ${title}`, 'case');
  };

  const updateCaseStatus = (id, status) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    const target = cases.find(c => c.id === id);
    addActivity(`Case ${target ? target.caseNumber : id} status updated to ${status}`, 'case');
  };

  const deleteCase = (id) => {
    const target = cases.find(c => c.id === id);
    setCases(prev => prev.filter(c => c.id !== id));
    addActivity(`Case ${target ? target.caseNumber : id} removed`, 'case');
  };

  const addHearing = (caseId, date, time, room, judge) => {
    const matchedCase = cases.find(c => c.id === caseId);
    const newHearing = {
      id: 'h_' + Date.now(),
      caseId,
      caseName: matchedCase ? matchedCase.title : 'General Briefing',
      date,
      time,
      room,
      judge,
      status: 'scheduled'
    };
    setHearings(prev => [...prev, newHearing]);
    addActivity(`Hearing scheduled for "${newHearing.caseName}" on ${date}`, 'hearing');
  };

  const deleteHearing = (id) => {
    const target = hearings.find(h => h.id === id);
    setHearings(prev => prev.filter(h => h.id !== id));
    addActivity(`Hearing for "${target ? target.caseName : 'Unknown'}" cancelled`, 'hearing');
  };

  const addPayment = (clientName, amount, type, category, date, status = 'completed') => {
    const newPayment = {
      id: 'p_' + Date.now(),
      clientName,
      amount: parseFloat(amount) || 0,
      type,
      category,
      date,
      status
    };
    setPayments(prev => [...prev, newPayment]);
    addActivity(`${type === 'credit' ? 'Credit receipt' : 'Expense debit'} of ₹${amount} logged for ${clientName}`, 'payment');
  };

  const deletePayment = (id) => {
    const target = payments.find(p => p.id === id);
    setPayments(prev => prev.filter(p => p.id !== id));
    addActivity(`Transaction record of ₹${target ? target.amount : ''} removed`, 'payment');
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      theme,
      clients,
      cases,
      hearings,
      payments,
      activities,
      login,
      logout,
      changePassword,
      forgotPassword,
      toggleTheme,
      addClient,
      deleteClient,
      addCase,
      updateCaseStatus,
      deleteCase,
      addHearing,
      deleteHearing,
      addPayment,
      deletePayment,
      signUp,
      updateProfile,
      isSupabaseConfigured
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
