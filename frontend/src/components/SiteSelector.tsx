import React from "react";
import { Link } from "lucide-react";

import NoSite from "./NoSite";
import { SiteType, useSite } from "../context/SiteContext";
import { Select } from "antd";
import ChatSection from "./Chat";
import SiteForm from "./SiteForm";

const Option = Select.Option;

const NEW_ITEM = "NEW_ITEM";
const SiteSelector: React.FC = () => {
    const { selectedSite, setSiteSelected, setOpenSiteModal, sites, setConversation } = useSite();

    const onChange = (value: SiteType | typeof NEW_ITEM) => {
        if (value !== NEW_ITEM) {
            console.log(value);
            setSiteSelected(sites.find((s) => s._id === value));
            setConversation([{
                role: "ai",
                text:
                    "Hi! I am your Site assistant. I am happy to help with your questions about the site",
            }])
        } else {
            setOpenSiteModal(true);
        }
    };

    const listOfSites = sites.map((o) => <Option key={o._id}>{o.name}</Option>);
    return (
        <>
            {!sites.length ? (
                <NoSite />
            ) : (
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <Select
                            value={selectedSite?._id as string}
                            style={{ width: 320 }}
                            onChange={onChange}
                        >
                            <>
                                {listOfSites}
                                <Option value={NEW_ITEM}>+ Add Site</Option>
                            </>
                        </Select>
                        <h2 key={selectedSite?._id} className="w-[40%]">
                            <a
                                href={selectedSite?.url}
                                target="_blank"
                                className="flex space-x-2 items-center justify-end"
                            >
                                <div>
                                    <Link />
                                </div>
                                <div className="text-xl text-ellipsis overflow-hidden">{selectedSite?.name}</div>
                            </a>
                        </h2>
                    </div>
                    <ChatSection />
                </div>
            )}
            {<SiteForm />}
        </>
    );
};

export default SiteSelector;
