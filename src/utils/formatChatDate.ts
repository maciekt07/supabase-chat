export function formatChatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // If the message was sent today, display the time
  if (diff < 86400000 && date.getDate() === now.getDate()) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
    return formattedTime;
  }

  // If the message was sent yesterday, display 'Yesterday' with the time
  if (diff < 172800000 && date.getDate() === now.getDate() - 1) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
    return `Yesterday ${formattedTime}`;
  }

  // Otherwise, display the full date and time
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const formattedDate = `${day} ${month} ${year}`;
  const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
  return `${formattedDate} ${formattedTime}`;
}
