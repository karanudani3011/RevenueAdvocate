import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { translations } from '../translations';

const AppContext = createContext();

const initialUsers = {};

const getTodayDateString = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const initialClients = [
  { id: 'c1', regDate: '2026-01-04', number: '246', caseType: 'ડી.એ. દાખલ', name: 'લાલુ આસુરામ હરીજન', caseDetails: '૧૨૨ના હુકમ સામે અપીલ', fee: '25000', paymentStatus: 'received', phone1: '9876543210', phone2: '' },
  { id: 'c2', regDate: '2026-01-07', number: '1739', caseType: 'ઈ.પી.એમ.સી.', name: 'દીપરાજ', caseDetails: 'ખાતા નંબર 419, ક્ષેત્રફળ ૧૮-૨ ઈ.પી. ૨૦૨૪', fee: '50000', paymentStatus: 'pending', phone1: '9876543211', phone2: '9876543212' },
  { id: 'c3', regDate: '2026-01-09', number: '4619', caseType: 'વકીલાત', name: 'નરેશ', caseDetails: 'ખાતા નંબર ૨૩૨, હે.૧૦.૧૪.૪૬, પ્ર.એચ.૨-૨૪-૯૩', fee: '35000', paymentStatus: 'received', phone1: '9876543213', phone2: '' },
  { id: 'c4', regDate: '2026-01-09', number: '3392', caseType: 'હક્કપત્રક', name: 'માવજી', caseDetails: 'ખાતા નંબર ૧૬૬, રે.સર્વે. ૨૧૨, ૧૨૩, ક્ષેત્રફળ ૨૯.૨૬.૦૭', fee: '15000', paymentStatus: 'pending', phone1: '9876543214', phone2: '' },
  { id: 'c5', regDate: '2026-01-12', number: '1427', caseType: 'ટી.એસ. દાખલ', name: 'મુકેશ', caseDetails: 'ખાતા નંબર ૧૨૫, રે.સર્વે. ૧૫૮, ૧૬૧', fee: '45000', paymentStatus: 'received', phone1: '9876543215', phone2: '9876543216' },
  { id: 'c6', regDate: '2026-01-20', number: '1517', caseType: 'હક્કપત્રક', name: 'હરિલાલ', caseDetails: 'ખાતા નંબર ૩૪૫, રે.સર્વે. ૬૬, ૭૫', fee: '30000', paymentStatus: 'pending', phone1: '9876543217', phone2: '' }
];

const initialCases = [
  { id: 'case1', filingDate: '2026-01-09', respondent: 'અમરાભાઈ ભીમાભાઈ કોલી', petitioner: 'જીવરાજભાઈ નારણભાઈ રબારી', propertyDetails: 'નાણી(મોટી) ગામના રે.સર્વે નંબર ૬૬૭, ક્ષેત્રફળ ૨.૧૧.૦૫ હે.', village: 'નાણી(મોટી)', status: 'active', remarks: 'દાખલ', extraDetail: '' },
  { id: 'case2', filingDate: '2026-01-12', respondent: 'ગોવિંદભાઈ મોહનલાલ સૂર્યાણી', petitioner: 'અમરાભાઈ ભીમાભાઈ', propertyDetails: 'ગોધરા ગામના રે.સર્વે નંબર ૫૧૭, ક્ષેત્રફળ ૩.૪૭.૨૧ હે.', village: 'ગોધરા', status: 'active', remarks: 'દાખલ', extraDetail: '' },
  { id: 'case3', filingDate: '2026-01-22', respondent: 'ખેંગારભાઈ વાલજીભાઈ કોલી', petitioner: 'મેરૂભાઈ કાનાભાઈ બળિયા', propertyDetails: 'ગોધરા ગામના રે.સર્વે નંબર ૧૪૩, ક્ષેત્રફળ ૨.૪૦.૦૦ હે.', village: 'ગોધરા', status: 'active', remarks: 'દાખલ', extraDetail: '' },
  { id: 'case4', filingDate: '2026-02-02', respondent: 'લાલજીભાઈ નારાણભાઈ પ્રજાપતિ', petitioner: 'અમરાભાઈ મોહનભાઈ', propertyDetails: 'મોડસર ગામના રે.સર્વે નંબર ૨૨૭, ક્ષેત્રફળ ૩.૪૫.૦૦ હે.', village: 'મોડસર', status: 'pending', remarks: 'દાખલ', extraDetail: '' },
  { id: 'case5', filingDate: '2026-02-11', respondent: 'ભીમજીભાઈ નથુભાઈ લાલજી', petitioner: 'મંગલસિંહ અજીતસિંહ વાઘેલા', propertyDetails: 'કોટડા ગામના રે.સર્વે નંબર ૧૫૬, ક્ષેત્રફળ ૧.૯૮.૦૦ હે.', village: 'કોટડા', status: 'pending', remarks: 'દાખલ', extraDetail: '' },
  { id: 'case6', filingDate: '2026-02-28', respondent: 'અમરાભાઈ કાનજીભાઈ મહેશ્વરી', petitioner: 'હર્ષદલાલ રામજીલાલ વ્યાસ', propertyDetails: 'નાણી(મોટી) ગામના રે.સર્વે નંબર ૨૪૭, ક્ષેત્રફળ ૨.૫૦.૦૦ હે.', village: 'નાણી(મોટી)', status: 'closed', remarks: 'બંધ', extraDetail: '' }
];

const initialMamlatdars = [
  { id: 'mam1', filingDate: '2026-01-09', respondent: 'અમરાભાઈ ભીમાભાઈ કોલી', petitioner: 'જીવરાજભાઈ નારણભાઈ રબારી', propertyDetails: 'નાણી(મોટી) ગામના રે.સર્વે નંબર ૬૬૭, ક્ષેત્રફળ ૨.૧૧.૦૫ હે.', village: 'નાણી(મોટી)', status: 'active', remarks: 'દાખલ', extraDetail: '' },
  { id: 'mam2', filingDate: '2026-01-12', respondent: 'ગોવિંદભાઈ મોહનલાલ સૂર્યાણી', petitioner: 'અમરાભાઈ ભીમાભાઈ', propertyDetails: 'ગોધરા ગામના રે.સર્વે નંબર ૫૧૭, ક્ષેત્રફળ ૩.૪૭.૨૧ હે.', village: 'ગોધરા', status: 'active', remarks: 'દાખલ', extraDetail: '' }
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

  const theme = 'light';

  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('adv_language');
    return saved || 'en';
  });

  useEffect(() => {
    localStorage.setItem('adv_language', language);
  }, [language]);

  const t = (key) => {
    if (language === 'gu' && translations.gu[key]) {
      return translations.gu[key];
    }
    return key;
  };

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

  const [mamlatdars, setMamlatdars] = useState(() => {
    const saved = localStorage.getItem('adv_mamlatdars');
    return saved ? JSON.parse(saved) : initialMamlatdars;
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
    localStorage.setItem('adv_mamlatdars', JSON.stringify(mamlatdars));
  }, [mamlatdars]);

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

  const changePassword = async (newPassword) => {
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
  const addClient = (regDate, number, caseType, name, caseDetails, fee, paymentStatus, phone1, phone2) => {
    const newClient = {
      id: 'c_' + Date.now(),
      regDate,
      number,
      caseType,
      name,
      caseDetails,
      fee,
      paymentStatus: paymentStatus || 'pending',
      phone1: phone1 || '',
      phone2: phone2 || ''
    };
    setClients(prev => [...prev, newClient]);
    addActivity(`New case register entry: ${name} (${number})`, 'client');
  };

  const updateClient = (id, updatedData) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
    const target = clients.find(c => c.id === id) || updatedData;
    addActivity(`Client profile updated: ${target.name}`, 'client');
  };

  const deleteClient = (id) => {
    const target = clients.find(c => c.id === id);
    if (!target) return;
    setClients(prev => prev.filter(c => c.id !== id));
    addActivity(`Client removed: ${target.name}`, 'client');
  };

  const addCase = (filingDate, respondent, petitioner, propertyDetails, village, status, remarks, extraDetail, pdfFileName) => {
    const newCase = {
      id: 'case_' + Date.now(),
      filingDate: filingDate || new Date().toISOString().split('T')[0],
      respondent,
      petitioner,
      propertyDetails,
      village,
      status: status || 'active',
      remarks: remarks || 'દાખલ',
      extraDetail: extraDetail || '',
      pdfFileName: pdfFileName || ''
    };
    setCases(prev => [...prev, newCase]);
    addActivity(`New sub register filed: ${petitioner} vs ${respondent} (${village})`, 'case');
  };

  const updateCase = (id, updatedData) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
    const target = cases.find(c => c.id === id) || updatedData;
    addActivity(`Sub register updated: ${target.petitioner} vs ${target.respondent}`, 'case');
  };

  const updateCaseStatus = (id, status) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    const target = cases.find(c => c.id === id);
    const label = target ? `${target.petitioner} vs ${target.respondent}` : id;
    addActivity(`Sub register "${label}" status updated to ${status}`, 'case');
  };

  const deleteCase = (id) => {
    const target = cases.find(c => c.id === id);
    const label = target ? `${target.petitioner} vs ${target.respondent}` : id;
    setCases(prev => prev.filter(c => c.id !== id));
    addActivity(`Sub register "${label}" removed`, 'case');
  };

  const addMamlatdar = (filingDate, respondent, petitioner, propertyDetails, village, status, remarks, extraDetail) => {
    const newMamlatdar = {
      id: 'mam_' + Date.now(),
      filingDate: filingDate || new Date().toISOString().split('T')[0],
      respondent,
      petitioner,
      propertyDetails,
      village,
      status: status || 'active',
      remarks: remarks || 'દાખલ',
      extraDetail: extraDetail || ''
    };
    setMamlatdars(prev => [...prev, newMamlatdar]);
    addActivity(`New mamlatdar filed: ${petitioner} vs ${respondent} (${village})`, 'case');
  };

  const updateMamlatdar = (id, updatedData) => {
    setMamlatdars(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
    const target = mamlatdars.find(c => c.id === id) || updatedData;
    addActivity(`Mamlatdar updated: ${target.petitioner} vs ${target.respondent}`, 'case');
  };

  const updateMamlatdarStatus = (id, status) => {
    setMamlatdars(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    const target = mamlatdars.find(c => c.id === id);
    const label = target ? `${target.petitioner} vs ${target.respondent}` : id;
    addActivity(`Mamlatdar "${label}" status updated to ${status}`, 'case');
  };

  const deleteMamlatdar = (id) => {
    const target = mamlatdars.find(c => c.id === id);
    const label = target ? `${target.petitioner} vs ${target.respondent}` : id;
    setMamlatdars(prev => prev.filter(c => c.id !== id));
    addActivity(`Mamlatdar "${label}" removed`, 'case');
  };

  const addHearing = (caseId, date, time, room, judge) => {
    const matchedCase = cases.find(c => c.id === caseId);
    const caseName = matchedCase
      ? `${matchedCase.petitioner} vs ${matchedCase.respondent}`
      : 'General Briefing';
    const newHearing = {
      id: 'h_' + Date.now(),
      caseId,
      caseName,
      date,
      time,
      room,
      judge,
      status: 'scheduled'
    };
    setHearings(prev => [...prev, newHearing]);
    addActivity(`Hearing scheduled for "${caseName}" on ${date}`, 'hearing');
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
      mamlatdars,
      hearings,
      payments,
      activities,
      login,
      logout,
      changePassword,
      forgotPassword,
      addClient,
      updateClient,
      deleteClient,
      addCase,
      updateCase,
      updateCaseStatus,
      deleteCase,
      addMamlatdar,
      updateMamlatdar,
      updateMamlatdarStatus,
      deleteMamlatdar,
      addHearing,
      deleteHearing,
      addPayment,
      deletePayment,
      signUp,
      updateProfile,
      isSupabaseConfigured,
      language,
      setLanguage,
      t
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
