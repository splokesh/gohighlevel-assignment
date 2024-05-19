import React from "react";
import ReactMarkdown from "react-markdown";
import { Avatar, List } from "antd";
import { useSite } from "../context/SiteContext";

const convertNewLines = (text: string) =>
    text.split("\n").map((line, i) => (
        <span key={i}>
            {line}
            <br />
        </span>
    ));

function formattedText(inputText: string) {
    return inputText
        .replace(/\n+/g, " ") // Replace multiple consecutive new lines with a single space
        .replace(/(\w) - (\w)/g, "$1$2") // Join hyphenated words together
        .replace(/\s+/g, " "); // Replace multiple consecutive spaces with a single space
}
const Conversations: React.FC = () => {
    const { conversation } = useSite();

    return (
        <List
            itemLayout="horizontal"
            dataSource={conversation}
            renderItem={(item, index) => (
                <List.Item key={`main-${index}`} className="mt-2">
                    {item.role === "user" ? (
                        <List.Item.Meta
                            avatar={
                                <Avatar
                                    src={`https://api.dicebear.com/7.x/miniavs/svg?seed=1`}
                                />
                            }
                            title={<p className="text-xl">User</p>}
                            description={<p className="text-base">{convertNewLines(item.text)}</p>}
                        />
                    ) : (
                        <List.Item.Meta
                            avatar={
                                <Avatar
                                    src={`https://api.dicebear.com/7.x/miniavs/svg?seed=0`}
                                />
                            }
                            title={<p className="text-xl">Assistant</p>}
                            description={
                                <ReactMarkdown className="text-base">{formattedText(item.text)}</ReactMarkdown>
                            }
                        />
                    )}
                </List.Item>
            )}
        />
    );
};

export default Conversations;
