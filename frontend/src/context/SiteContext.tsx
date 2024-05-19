import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { fetchSites as fetchSitesFromApi } from "../api";

export interface SiteType {
  name: string;
  url: string;
  _id: string;
}

export interface ConversationType {
  role: "ai" | "user";
  text: string;
}

export interface SiteContextProps {
  sites: SiteType[];
  openSiteModal: boolean;
  setOpenSiteModal: (open: boolean) => void;
  fetchSites: () => void;
  selectedSite: SiteType | null;
  setSiteSelected: (site: SiteType) => void;
  conversation: ConversationType[],
  setConversation: React.Dispatch<React.SetStateAction<ConversationType[]>>
}

const SiteContext = createContext<SiteContextProps | undefined>(undefined);

export const SiteProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [sites, setSites] = useState<SiteType[]>([]);
  const [openSiteModal, setOpenSiteModal] = useState<boolean>(false);
  const [selectedSite, setSiteSelected] = useState<SiteType | null>(null);
  const [conversation, setConversation] = useState<ConversationType[]>([{
    role: "ai",
    text:
      "Hi! I am your Site assistant. I am happy to help with your questions about the site",
  },]);

  const fetchSites = async () => {
    try {
      const data = await fetchSitesFromApi();
      setSites(data);
      if (selectedSite === null) {
        setSiteSelected(data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch sites:", error);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  return (
    <SiteContext.Provider
      value={{
        sites,
        openSiteModal,
        setOpenSiteModal,
        fetchSites,
        selectedSite,
        setSiteSelected,
        conversation,
        setConversation,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = (): SiteContextProps => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error("useSite must be used within a SiteProvider");
  }
  return context;
};
