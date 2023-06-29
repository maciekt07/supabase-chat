import styled from "styled-components";
import { Message } from "../types/collection";
import { formatChatDate } from "../utils";
import defaultAvatar from "../assets/defaultAvatar.png";
import deleteSvg from "../assets/delete.svg";
import { supabase } from "../lib/supabase-client";
import { useState } from "react";

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
}

export const ChatMessage = ({ message, isCurrentUser }: ChatMessageProps) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const toggleHover = () => {
    setIsHovered(!isHovered);
  };
  const handleDeleteMessage = async () => {
    try {
      const { error } = await supabase
        .from("Chat")
        .update({ deleted: true })
        .eq("id", message.id);
      if (error) {
        console.error("Error deleting message:", error);
        return;
      }
      console.log("Message deleted successfully!");
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const username =
    message.provider !== "email"
      ? message.user_name
      : message.user_name !== null &&
        message.user_name.substring(0, 6) +
          "*".repeat(message.user_name.length - 6);
  return (
    <Container
      isCurrentUser={isCurrentUser}
      onMouseEnter={toggleHover}
      onMouseLeave={toggleHover}
    >
      {" "}
      <MessageBubble isCurrentUser={isCurrentUser}>
        {isCurrentUser && isHovered && !message.deleted && (
          <DeleteButton src={deleteSvg} onClick={handleDeleteMessage} />
        )}

        <Avatar src={message.user_avatar_url || defaultAvatar} alt="pfp" />
        <div>
          <MessageInfo>
            {message.provider === "github" ? (
              <NameLink href={`https://github.com/${username}`} target="_blank">
                {username}
              </NameLink>
            ) : (
              username
            )}{" "}
            <Timestamp>
              {message.created_at
                ? formatChatDate(new Date(message.created_at))
                : null}
            </Timestamp>
          </MessageInfo>
          <div style={{ wordBreak: "break-all" }}>
            {!message.deleted ? (
              message.message_content
            ) : (
              <Deleted>Message Deleted</Deleted>
            )}
          </div>
        </div>
      </MessageBubble>
    </Container>
  );
};

const Container = styled.div<{ isCurrentUser: boolean }>`
  display: flex;
  justify-content: ${(props) =>
    props.isCurrentUser ? "flex-end" : "flex-start"};
  align-items: center;
  margin-bottom: 16px;
  gap: 6px;
`;

const MessageBubble = styled.div<{ isCurrentUser: boolean }>`
  display: flex;
  gap: 6px;
  align-items: center;
  background-color: ${(props) => (props.isCurrentUser ? "#9436ff" : "#14ac68")};
  color: white;
  border-radius: ${(props) =>
    props.isCurrentUser ? "28px 28px 6px 28px" : "28px 28px 28px 6px"};
  padding: 8px 12px;
  max-width: 350px;
  box-shadow: 0 4px 14px 2px
    ${(props) => (props.isCurrentUser ? "#9436ff48" : "#14ac6848")};
`;
const DeleteButton = styled.img`
  width: 24px;
  cursor: pointer;
  transition: 0.3s filter;

  &:hover {
    filter: brightness(0.8) saturate(1.5) hue-rotate(0deg);
  }
`;
const Avatar = styled.img`
  border-radius: 100%;
  width: 48px;
  margin: 4px;
`;

const MessageInfo = styled.div`
  font-weight: bold;
  margin-right: 4px;
  font-size: 16px;
`;

const Timestamp = styled.span`
  font-size: 12px;
  font-weight: 400;
  font-style: italic;
`;

const Deleted = styled.span`
  font-style: italic;
  color: #ff5b5b;
  text-shadow: 0 0 6px #ff5b5bd9;
`;

const NameLink = styled.a`
  color: white;
  cursor: pointer;
  transition: 0.3s color;
  text-decoration: underline;
  &:hover {
    color: #ff00e6;
  }
`;
