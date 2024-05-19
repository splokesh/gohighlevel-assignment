import React, { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

import { Button, Card, Input, message } from "antd";
import Conversations from "./Conversation";
import { useSite } from "../context/SiteContext";
import { getAnswer } from "../api";

const TextArea = Input.TextArea;

export function scrollToBottom(containerRef: React.RefObject<HTMLElement>) {
    if (containerRef.current) {
        const listItems = containerRef.current.getElementsByTagName('li');

        if (listItems.length > 0) {
            const lastListItem = listItems[listItems.length - 1];

            if (lastListItem) {
                const scrollOptions: ScrollIntoViewOptions = {
                    behavior: "smooth",
                    block: "end",
                };
                lastListItem.scrollIntoView(scrollOptions);
            }
        }

    }
}


const ChatSection: React.FC = () => {
    const { conversation, setConversation, selectedSite } = useSite()
    const [value, setValue] = useState("")
    const [disabled, setDisable] = useState(false)
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setTimeout(() => scrollToBottom(containerRef), 100);
    }, [conversation.length]);

    const handleChange = ({ target: { value } }) => {
        setValue(value)
    }

    const handleSubmit = () => {
        setDisable(true)

        const question = value;
        setConversation(prev => {
            prev.push({
                role: "user",
                text: question
            })

            setValue("")
            return prev
        })

        getAnswer({ id: selectedSite?._id as string, question: question }).then((data) => {
            console.log("/ data", data)

            setConversation(prev => {
                prev.push({
                    role: "ai",
                    text: data
                })
                return prev
            })

        }).catch(err => {
            message.error("An error occured while getting answer")
            console.error(err)
            setConversation(prev => {
                prev.push({
                    role: "ai",
                    text: "An error occured while getting answer"
                })
                return prev
            })
        }).finally(() => {
            setDisable(false)
        })
    }

    return (
        <Card className="px-15 border-0 ">
            <div className="h-[570px] overflow-y-auto" ref={containerRef}>
                <Conversations />
            </div>
            <form className="flex items-end rounded-3xl border-2 p-2 space-x-2 clear-both">
                <TextArea
                    disabled={disabled}
                    value={value}
                    autoSize={{ minRows: 2, maxRows: 6 }}
                    rows={4}
                    onChange={handleChange}
                    className="border-0 hover:bottom-0 focus:bottom-0 active:bottom-0 focus-visible:bottom-0 focus-within:bottom-0"
                    placeholder="Ask anything about the site"
                    size="large"
                />
                <Button icon={<Send />} className="border-0 mb-3" disabled={disabled} loading={disabled} onClick={handleSubmit} />
            </form>
        </Card>
    );
};

export default ChatSection;
