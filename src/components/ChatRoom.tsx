import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase-client";
import { useEffect, useState } from "react";
import { Message } from "../types/collection";
import styled from "styled-components";
import { ChatMessage } from ".";
import defaultAvatar from "../assets/defaultAvatar.png";
interface ChatRoomProps {
  session: Session;
}

export const ChatRoom = ({ session }: ChatRoomProps) => {
  const user = session.user as User;
  const [messages, setMessages] = useState<Message[]>();
  const [waitTime, setWaitTime] = useState<number>(0);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [messageToSend, setMessageToSend] = useState<string>("");

  const userName =
    user.user_metadata.preferred_username ||
    user.user_metadata.name ||
    user.email;

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from("Chat").select("*");

      setMessages(data ?? []);
    };
    scrollToBottom(false);
    fetchData();
    const channel = supabase
      .channel("Chat")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
        },
        () => {
          fetchData();
        }
      )
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, []);

  const scrollToBottom = (smooth: boolean = true) => {
    setTimeout(() => {
      window.scroll({
        top: document.body.scrollHeight,
        behavior: smooth ? "smooth" : "instant",
      });
    }, 500);
  };

  const handleSendMessage = async () => {
    if (isSending || waitTime > 0) {
      return;
    }

    const newMessage = {
      user_name: userName,
      message_content: messageToSend,
      user_avatar_url: user.user_metadata.avatar_url || null,
      user_id: user.id,
      provider: user.app_metadata.provider,
    };

    setIsSending(true);
    const { error } = await supabase.from("Chat").insert([newMessage]);

    if (error) {
      alert(error);
    } else {
      setMessageToSend("");
      scrollToBottom();
      setIsSending(false);

      setWaitTime(3);
      const timer = setInterval(() => {
        setWaitTime((prevWaitTime) => prevWaitTime - 1);
      }, 1000);

      setTimeout(() => {
        clearInterval(timer);
        setWaitTime(0);
      }, 3000);
    }
  };
  return (
    <>
      <TopBar>
        <TopBarContent>
          <SignOut onClick={() => supabase.auth.signOut()}>Sign Out</SignOut>
          <UserName>
            Logged as:{" "}
            <Avatar
              src={user.user_metadata.avatar_url || defaultAvatar}
              alt="pfp"
            />{" "}
            {userName}
          </UserName>
        </TopBarContent>
      </TopBar>
      <Container>
        {messages &&
          messages
            .sort((a, b) => a.id - b.id) // Sort the messages by ID in ascending order
            .map((message: Message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isCurrentUser={user.id === message.user_id}
              />
            ))}
      </Container>
      <InputContainer>
        <MessageInput
          type="text"
          placeholder={
            waitTime > 0 ? `Wait ${waitTime} seconds` : "Type a message"
          }
          value={messageToSend}
          onChange={(e) => setMessageToSend(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          disabled={isSending || waitTime > 0}
        />
        <SendButton
          onClick={handleSendMessage}
          disabled={isSending || waitTime > 0 || messageToSend.length > 255}
        >
          {isSending ? "Sending..." : "Send"}
        </SendButton>
      </InputContainer>
    </>
  );
};

const TopBar = styled.div`
  position: fixed;
  top: 0;
  background-color: #101010cc;
  backdrop-filter: blur(6px);
  width: 100%;
`;

const TopBarContent = styled.div`
  display: flex;
  justify-content: left;
  align-items: center;
  margin: 0 22vw;
  gap: 12px;
  @media (max-width: 1024px) {
    margin: 0;
    gap: 4px;
  }
`;

const SignOut = styled.button`
  padding: 12px 18px;
  font-size: 16px;
  margin: 8px;
  background: #333;
  border-radius: 10px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: 0.3s border;
  &:hover {
    border: 2px solid #14ac68;
  }
`;
const Avatar = styled.img`
  border-radius: 100%;
  width: 32px;
  margin: 0 6px;
`;

const UserName = styled.p`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
`;

const Container = styled.div`
  padding: 20px;
  margin: 75px 22vw;

  @media (max-width: 1024px) {
    margin: 75px 0;
  }
`;

const InputContainer = styled.div`
  position: fixed;
  bottom: 0;
  margin: 0;
  background-color: #101010cc;
  backdrop-filter: blur(6px);
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  /* gap: 6px; */
  padding: 12px 0;
`;

const MessageInput = styled.input`
  padding: 10px 18px;
  font-size: 18px;
  /* border-radius: 100px; */
  border-radius: 14px 0 0 14px;
  border: 2px solid transparent;
  transition: 0.3s all;
  &:not(:disabled) {
    &:hover {
      border: 2px solid #14ac68;
    }
    &:focus {
      outline: none;
      border: 2px solid #14ac68;
    }
  }
`;

const SendButton = styled.button`
  padding: 10px 18px;
  font-size: 18px;
  border-radius: 0 14px 14px 0;
  border: none;
  cursor: pointer;
  transition: 0.3s all;
  background-color: #14ac68;
  border: 2px solid #14ac68;
  text-transform: uppercase;
  &:not(:disabled) {
    &:hover {
      background-color: #2ccb83;
    }
  }
`;
