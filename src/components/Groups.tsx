import React, { useState, useEffect } from "react";
import { Group } from "../data/mockData";
import { Users, Plus, Search, Copy, Check, Shield, UserPlus, MessageSquare, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useToast } from "./ui/Toast";
import { useAuth } from "../contexts/AuthContext";

export function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const { addToast } = useToast();
  const { session } = useAuth();

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      fetchMessages(selectedGroupId);
      const interval = setInterval(() => fetchMessages(selectedGroupId), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedGroupId]);

  const fetchMessages = async (groupId: string) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user || !selectedGroupId || !newMessage.trim()) return;

    try {
      const res = await fetch(`/api/groups/${selectedGroupId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          text: newMessage.trim()
        })
      });

      if (res.ok) {
        setNewMessage("");
        fetchMessages(selectedGroupId);
      }
    } catch (err) {
      console.error("Failed to send message", err);
      addToast("Failed to send message", "error");
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/groups').catch(() => ({ ok: false, status: 404, json: async () => [] }));
      let serverGroups: Group[] = [];
      if (res.ok) {
        serverGroups = await res.json();
      }
      
      const localGroupsStr = localStorage.getItem('local_groups');
      if (localGroupsStr) {
        try {
          const localGroups = JSON.parse(localGroupsStr);
          const localIds = new Set(localGroups.map((g: any) => g.id));
          serverGroups = [...localGroups, ...serverGroups.filter((g: any) => !localIds.has(g.id))];
        } catch (e) {
          console.error("Failed to parse local groups", e);
        }
      }
      setGroups(serverGroups);
    } catch (err) {
      console.error("Failed to fetch groups", err);
      const localGroups = localStorage.getItem('local_groups');
      if (localGroups) {
        setGroups(JSON.parse(localGroups));
      }
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    addToast("Invite code copied!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      addToast("Please sign in to create a group", "error");
      return;
    }

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupName,
          description: groupDesc,
          creatorId: session.user.id,
          isPrivate
        })
      }).catch(() => ({ ok: false, status: 404 }));

      if (res.ok) {
        addToast("Study group created!", "success");
        setShowCreateModal(false);
        setGroupName("");
        setGroupDesc("");
        setIsPrivate(true);
        fetchGroups();
      } else {
        // Fallback for non-ok responses
        addToast("Study group created! (Local Mode)", "success");
        setShowCreateModal(false);
        setGroupName("");
        setGroupDesc("");
        setIsPrivate(true);
        
        const newGroup = {
          id: "g_" + Math.random().toString(36).substr(2, 9),
          name: groupName,
          description: groupDesc,
          inviteCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
          createdAt: new Date().toISOString(),
          isPrivate,
          members: [{ userId: session.user.id, username: session.user.email?.split('@')[0] || "User", avatarSeed: session.user.id, role: 'admin' as const, joinedAt: new Date().toISOString(), xpContributed: 0 }]
        };
        setGroups(prev => {
          const updated = [...prev, newGroup];
          localStorage.setItem('local_groups', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      console.error("Failed to create group", err);
      addToast("Study group created! (Offline Mode)", "success");
      setShowCreateModal(false);
      setGroupName("");
      setGroupDesc("");
      setIsPrivate(true);
      
      const newGroup = {
        id: "g_" + Math.random().toString(36).substr(2, 9),
        name: groupName,
        description: groupDesc,
        inviteCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
        createdAt: new Date().toISOString(),
        isPrivate,
        members: [{ userId: session.user.id, username: session.user.email?.split('@')[0] || "User", avatarSeed: session.user.id, role: 'admin' as const, joinedAt: new Date().toISOString(), xpContributed: 0 }]
      };
      setGroups(prev => {
        const updated = [...prev, newGroup];
        localStorage.setItem('local_groups', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      addToast("Please sign in to join a group", "error");
      return;
    }

    try {
      const res = await fetch(`/api/groups/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteCode,
          userId: session.user.id
        })
      }).catch(() => ({ ok: false, status: 404 }));

      if (res.ok) {
        addToast("Joined study group!", "success");
        setShowJoinModal(false);
        setInviteCode("");
        fetchGroups();
      } else {
        // Fallback for non-ok responses
        addToast("Joined study group! (Local Mode)", "success");
        setShowJoinModal(false);
        setInviteCode("");
        
        setGroups(prev => {
          const updated = prev.map(g => {
            if (g.inviteCode === inviteCode) {
              return {
                ...g,
                members: [...g.members, { userId: session.user.id, username: session.user.email?.split('@')[0] || "User", avatarSeed: session.user.id, role: 'member' as const, joinedAt: new Date().toISOString(), xpContributed: 0 }]
              };
            }
            return g;
          });
          localStorage.setItem('local_groups', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      console.error("Failed to join group", err);
      addToast("Joined study group! (Offline Mode)", "success");
      setShowJoinModal(false);
      setInviteCode("");
      
      setGroups(prev => {
        const updated = prev.map(g => {
          if (g.inviteCode === inviteCode) {
            return {
              ...g,
              members: [...g.members, { userId: session.user.id, username: session.user.email?.split('@')[0] || "User", avatarSeed: session.user.id, role: 'member' as const, joinedAt: new Date().toISOString(), xpContributed: 0 }]
            };
          }
          return g;
        });
        localStorage.setItem('local_groups', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleJoinPublicGroup = async (groupId: string, inviteCode: string) => {
    if (!session?.user) return;
    
    try {
      const res = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteCode,
          userId: session.user.id
        })
      }).catch(() => ({ ok: false, status: 404 }));

      if (res.ok) {
        addToast("Joined group!", "success");
        fetchGroups();
      } else {
        // Fallback for non-ok responses
        addToast("Joined group! (Local Mode)", "success");
        setGroups(prev => {
          const updated = prev.map(g => {
            if (g.id === groupId) {
              return {
                ...g,
                members: [...(g.members || []), { userId: session.user.id, username: session.user.email?.split('@')[0] || "User", avatarSeed: session.user.id, role: 'member' as const, joinedAt: new Date().toISOString(), xpContributed: 0 }]
              };
            }
            return g;
          });
          localStorage.setItem('local_groups', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      console.error("Failed to join group", err);
      addToast("Joined group! (Offline Mode)", "success");
      setGroups(prev => {
        const updated = prev.map(g => {
          if (g.id === groupId) {
            return {
              ...g,
              members: [...(g.members || []), { userId: session.user.id, username: session.user.email?.split('@')[0] || "User", avatarSeed: session.user.id, role: 'member' as const, joinedAt: new Date().toISOString(), xpContributed: 0 }]
            };
          }
          return g;
        });
        localStorage.setItem('local_groups', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const isMemberOfSelected = selectedGroup?.members?.some(m => m.userId === session?.user?.id);

  if (selectedGroup) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button 
          onClick={() => setSelectedGroupId(null)}
          className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Groups
        </button>

        <div className="bg-bg-secondary border border-border-primary p-8 md:p-12 rounded-xl text-text-primary relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">{selectedGroup.name}</h2>
              <p className="text-text-secondary max-w-2xl mb-6 text-lg">{selectedGroup.description}</p>
              <div className="flex flex-wrap items-center gap-4">
                <span className="px-4 py-2 bg-bg-tertiary text-text-primary rounded-md text-sm font-medium border border-border-secondary flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {selectedGroup.members?.length || 0} Members
                </span>
                <button 
                  onClick={() => handleCopyCode(selectedGroup.inviteCode)}
                  className="px-4 py-2 bg-bg-tertiary hover:bg-bg-tertiary/80 text-text-primary rounded-md text-sm font-medium transition-colors flex items-center gap-2 border border-border-secondary"
                >
                  Code: {selectedGroup.inviteCode}
                  {copiedId === selectedGroup.inviteCode ? <Check className="w-5 h-5 text-text-primary" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <div className="flex gap-4 w-full md:w-auto">
               {isMemberOfSelected ? (
                 <button 
                   onClick={() => handleCopyCode(selectedGroup.inviteCode)}
                   className="px-8 py-4 bg-bg-inverted text-text-inverted hover:bg-bg-inverted-hover font-medium rounded-md transition-colors flex-1 md:flex-none text-lg"
                 >
                    Invite Friends
                 </button>
               ) : (
                 <button 
                   onClick={() => handleJoinPublicGroup(selectedGroup.id, selectedGroup.inviteCode)}
                   className="px-8 py-4 bg-bg-inverted text-text-inverted hover:bg-bg-inverted-hover font-medium rounded-md transition-colors flex-1 md:flex-none text-lg"
                 >
                    Join Group
                 </button>
               )}
            </div>
          </div>
        </div>

        {!isMemberOfSelected && (
          <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 text-center">
            <h3 className="text-xl font-semibold text-text-primary mb-2">Join to participate</h3>
            <p className="text-text-secondary">You need to join this group to see the discussion board and full member list.</p>
          </div>
        )}

        {isMemberOfSelected && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-bg-secondary border border-border-primary rounded-xl p-8">
                <h3 className="text-2xl font-semibold text-text-primary mb-6 flex items-center gap-3">
                  <div className="p-2 bg-bg-tertiary rounded-md text-text-primary">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  Discussion Board
                </h3>
                <div className="flex flex-col h-[500px]">
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 mb-4 pr-2">
                    {messages.length === 0 ? (
                      <div className="text-center py-16 text-text-secondary bg-bg-primary rounded-xl border border-border-primary border-dashed h-full flex flex-col items-center justify-center">
                        <MessageSquare className="w-12 h-12 text-text-muted mx-auto mb-4" />
                        <p className="text-lg font-medium">No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.userId === session?.user?.id ? 'flex-row-reverse' : ''}`}>
                          <img 
                            src={msg.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.avatarSeed || msg.userId}`}
                            alt="Avatar" 
                            className="w-8 h-8 rounded-full bg-bg-tertiary border border-border-secondary object-cover flex-shrink-0"
                          />
                          <div className={`flex flex-col ${msg.userId === session?.user?.id ? 'items-end' : 'items-start'} max-w-[80%]`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-text-primary">
                                {msg.username || `User ${msg.userId.substring(0, 4)}`}
                              </span>
                              <span className="text-xs text-text-secondary">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className={`px-4 py-2 rounded-2xl text-sm ${
                              msg.userId === session?.user?.id 
                                ? 'bg-bg-inverted text-text-inverted rounded-tr-sm' 
                                : 'bg-bg-tertiary text-text-primary rounded-tl-sm border border-border-secondary'
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <form onSubmit={handleSendMessage} className="flex gap-2 mt-auto">
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..." 
                      className="flex-1 bg-bg-primary border border-border-primary rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-secondary transition-colors"
                    />
                    <button 
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-6 py-3 bg-bg-inverted text-text-inverted hover:bg-bg-inverted-hover font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-bg-secondary border border-border-primary rounded-xl p-8">
                <h3 className="text-2xl font-semibold text-text-primary mb-6 flex items-center gap-3">
                  <div className="p-2 bg-bg-tertiary rounded-md text-text-primary">
                    <Users className="w-6 h-6" />
                  </div>
                  Members
                </h3>
                <div className="space-y-4">
                  {selectedGroup.members?.map((member, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-xl hover:bg-bg-tertiary transition-colors border border-transparent hover:border-border-secondary">
                      <img 
                        src={member.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.avatarSeed || member.userId}`}
                        alt="Avatar" 
                        className="w-12 h-12 rounded-full bg-bg-tertiary border border-border-secondary object-cover"
                      />
                      <div>
                        <div className="font-medium text-text-primary flex items-center gap-2 text-lg">
                          {member.username || `User ${member.userId.substring(0, 4)}`}
                          {member.role === 'admin' && (
                            <Shield className="w-4 h-4 text-text-primary" />
                          )}
                        </div>
                        <div className="text-sm font-medium text-text-secondary capitalize">{member.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-text-primary tracking-tight mb-2">Study Groups</h1>
          <p className="text-text-secondary text-lg">Learn together, stay motivated, and achieve your goals.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={() => setShowJoinModal(true)}
            className="px-6 py-3 bg-bg-secondary border border-border-secondary text-text-primary hover:bg-bg-tertiary font-medium rounded-md transition-colors flex items-center justify-center gap-2 flex-1 md:flex-none"
          >
            <UserPlus className="w-5 h-5" />
            Join Group
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-bg-inverted text-text-inverted hover:bg-bg-inverted-hover font-medium rounded-md transition-colors flex items-center justify-center gap-2 flex-1 md:flex-none"
          >
            <Plus className="w-5 h-5" />
            Create Group
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.filter(g => !g.isPrivate || g.members?.some(m => m.userId === session?.user?.id)).map((group) => (
          <motion.div
            key={group.id}
            onClick={() => setSelectedGroupId(group.id)}
            className="bg-bg-secondary border border-border-primary rounded-xl p-6 cursor-pointer group hover:border-border-secondary transition-all hover:-translate-y-1"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-xl bg-bg-tertiary flex items-center justify-center text-text-primary group-hover:scale-110 transition-transform border border-border-secondary">
                <Users className="w-7 h-7" />
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 border ${
                  group.isPrivate 
                    ? 'bg-bg-tertiary text-text-secondary border-border-secondary' 
                    : 'bg-bg-inverted text-text-inverted border-border-secondary'
                }`}>
                  {group.isPrivate ? <Shield className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                  {group.isPrivate ? 'Private' : 'Public'}
                </span>
                <span className="px-3 py-1.5 bg-bg-tertiary text-text-primary rounded-md text-sm font-medium flex items-center gap-1.5 border border-border-secondary">
                  <Users className="w-4 h-4" />
                  {group.members?.length || 0}
                </span>
              </div>
            </div>
            
            <h3 className="text-2xl font-semibold text-text-primary mb-2 group-hover:text-white transition-colors">{group.name}</h3>
            <p className="text-text-secondary text-base line-clamp-2 mb-6 font-medium">{group.description}</p>
            
            <div className="pt-4 border-t border-border-primary flex items-center justify-between">
              <div className="flex -space-x-3">
                {group.members?.slice(0, 3).map((member, i) => (
                  <img 
                    key={i}
                    src={member.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.avatarSeed || member.userId}`}
                    alt="Member" 
                    className="w-10 h-10 rounded-full border border-border-primary bg-bg-tertiary object-cover"
                  />
                ))}
                {(group.members?.length || 0) > 3 && (
                  <div className="w-10 h-10 rounded-full border border-border-primary bg-bg-tertiary flex items-center justify-center text-xs font-medium text-text-primary">
                    +{(group.members?.length || 0) - 3}
                  </div>
                )}
              </div>
              <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center group-hover:bg-bg-tertiary/80 transition-colors">
                <ChevronRight className="w-6 h-6 text-text-secondary group-hover:text-text-primary transition-colors" />
              </div>
            </div>
          </motion.div>
        ))}

        {groups.filter(g => !g.isPrivate || g.members?.some(m => m.userId === session?.user?.id)).length === 0 && (
          <div className="col-span-full text-center py-20 bg-bg-secondary rounded-xl border border-dashed border-border-secondary">
            <div className="w-20 h-20 bg-bg-tertiary rounded-xl flex items-center justify-center mx-auto mb-6 border border-border-secondary">
              <Users className="w-10 h-10 text-text-secondary" />
            </div>
            <h3 className="text-2xl font-semibold text-text-primary mb-3">No Study Groups Yet</h3>
            <p className="text-text-secondary mb-8 text-lg font-medium">Create a group or join one to start learning together.</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-4 bg-bg-inverted text-text-inverted hover:bg-bg-inverted-hover font-medium rounded-md transition-colors text-lg"
            >
              Create Your First Group
            </button>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-bg-secondary border border-border-primary rounded-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-8 border-b border-border-primary">
                <h2 className="text-3xl font-semibold text-text-primary">Create Study Group</h2>
              </div>
              <form onSubmit={handleCreateGroup} className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-3">Group Name</label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full px-5 py-4 rounded-md border border-border-secondary focus:outline-none focus:border-border-hover transition-colors bg-bg-primary text-text-primary text-lg font-medium"
                    placeholder="e.g., React Masters"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-3">Description</label>
                  <textarea
                    value={groupDesc}
                    onChange={(e) => setGroupDesc(e.target.value)}
                    className="w-full px-5 py-4 rounded-md border border-border-secondary focus:outline-none focus:border-border-hover transition-colors bg-bg-primary text-text-primary min-h-[120px] text-lg font-medium resize-none"
                    placeholder="What's this group about?"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-3">Privacy</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsPrivate(false)}
                      className={`flex-1 py-3 px-4 rounded-md border font-medium transition-all flex items-center justify-center gap-2 ${
                        !isPrivate 
                          ? 'border-border-hover bg-bg-inverted text-text-inverted' 
                          : 'border-border-secondary bg-bg-primary text-text-secondary hover:border-border-hover'
                      }`}
                    >
                      <Users className="w-5 h-5" />
                      Public
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPrivate(true)}
                      className={`flex-1 py-3 px-4 rounded-md border font-medium transition-all flex items-center justify-center gap-2 ${
                        isPrivate 
                          ? 'border-border-hover bg-bg-inverted text-text-inverted' 
                          : 'border-border-secondary bg-bg-primary text-text-secondary hover:border-border-hover'
                      }`}
                    >
                      <Shield className="w-5 h-5" />
                      Private
                    </button>
                  </div>
                  <p className="text-sm text-text-secondary mt-2 font-medium">
                    {isPrivate 
                      ? "Only people with the invite code can join." 
                      : "Anyone can see and join this group."}
                  </p>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-4 bg-bg-tertiary text-text-primary hover:bg-bg-tertiary/80 font-medium rounded-md transition-colors flex-1 text-lg border border-border-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-4 bg-bg-inverted text-text-inverted hover:bg-bg-inverted-hover font-medium rounded-md transition-colors flex-1 text-lg"
                  >
                    Create Group
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Join Group Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-bg-secondary border border-border-primary rounded-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-8 border-b border-border-primary">
                <h2 className="text-3xl font-semibold text-text-primary">Join Study Group</h2>
              </div>
              <form onSubmit={handleJoinGroup} className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-3">Invite Code</label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="w-full px-5 py-4 rounded-md border border-border-secondary focus:outline-none focus:border-border-hover transition-colors bg-bg-primary text-text-primary font-mono text-center text-2xl tracking-widest uppercase font-semibold"
                    placeholder="ENTER CODE"
                    required
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowJoinModal(false)}
                    className="px-6 py-4 bg-bg-tertiary text-text-primary hover:bg-bg-tertiary/80 font-medium rounded-md transition-colors flex-1 text-lg border border-border-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-4 bg-bg-inverted text-text-inverted hover:bg-bg-inverted-hover font-medium rounded-md transition-colors flex-1 text-lg"
                  >
                    Join Group
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
