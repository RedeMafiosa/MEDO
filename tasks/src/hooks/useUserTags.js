const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useQuery } from "@tanstack/react-query";

// Fetches all active MemberTags (cached globally)
export function useAllTags() {
  return useQuery({
    queryKey: ["member-tags-active"],
    queryFn: () => db.entities.MemberTag.filter({ is_active: true }, "-priority", 50),
    staleTime: 0,
  });
}

// Given a profile's tags array (names) and all tags, return the matching tag objects
export function resolveUserTags(profileTags = [], allTags = []) {
  return (profileTags || [])
    .map(name => allTags.find(t => t.name === name))
    .filter(Boolean);
}

// Fetch tags for a specific user_id by looking up their profile
export function useUserTagsByUserId(userId) {
  const { data: allTags = [] } = useAllTags();

  const { data: profile } = useQuery({
    queryKey: ["profile-tags", userId],
    queryFn: async () => {
      if (!userId || userId === "anon") return null;
      const profiles = await db.entities.UserProfile.filter({ user_id: userId }, "-created_date", 1);
      return profiles[0] || null;
    },
    enabled: !!userId && userId !== "anon",
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  return resolveUserTags(profile?.tags, allTags);
}