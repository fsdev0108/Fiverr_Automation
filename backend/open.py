import threading
from slack_sdk.web import WebClient
from slack_sdk.socket_mode import SocketModeClient
from slack_sdk.socket_mode.request import SocketModeRequest
from slack_sdk.socket_mode.response import SocketModeResponse
from pathlib import Path
import time
import webbrowser

BASE_DIR = Path(__file__).resolve().parent
brave_path = r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"
webbrowser.register('brave', None, webbrowser.BackgroundBrowser(brave_path))

# Bot token (xoxb-)
bot_token = "xoxb-9973572511315-10004537023927-xZ1Jkp3htz3BqVzmRdgLIeJn"
# App-level token (xapp-)
app_token = "xapp-1-A0A0GFG1MJ9-10021269334086-8a94663f73987c044e42e0b64e4f10ea3d0e2e004cb57a1241137760f9729f6e"

web_client = WebClient(token=bot_token)
socket_client = SocketModeClient(app_token=app_token, web_client=web_client)
#10, eu, us
#Get bot user ID
bot_info = web_client.auth_test()
BOT_USER_ID = bot_info["user_id"]

def process(client: SocketModeClient, req: SocketModeRequest):
    # Acknowledge the request right away
    # print("Processing new request:", req.type)
    response = SocketModeResponse(envelope_id=req.envelope_id)
    client.send_socket_mode_response(response)
    if req.type == "events_api":
        event = req.payload.get("event", {})

        # Only capture direct messages
        if event.get("type") == "message" and event.get("channel_type") == "im":
            user = event.get("user")
            text = event.get("text","").strip()
            channel = event.get("channel")
            # print(f"Received message from user {user}: {text}")     
            if not user or not text:
                return
            
            # Ignore messages sent by the bot itself
            if user == BOT_USER_ID:
                return
            
            if user == "U09URTN5NUW":
                open_cmd(text)
def send_line_count_periodically(channel_id, file_path):
    last_count = None  # store previous count

    while True:
        try:
            with open(file_path, "r") as f:
                lines = f.readlines()
            count = len(lines)

            # Only send if changed
            if last_count is None:
                last_count = count  # initialize
            elif count != last_count:
                web_client.chat_postMessage(
                    channel=channel_id,
                    text=f"Current lines remaining: *{count}*"
                )
                print(f"Sent updated line count: {count}")
                last_count = count
            else:
                print("Line count unchanged:", count)

        except Exception as e:
            print("Error in reporter:", e)

        time.sleep(10)  # 5 minutes


socket_client.socket_mode_request_listeners.append(process)

# Connect
socket_client.connect()
print("socket is connected")

# Start 5-minute reporter
report_thread = threading.Thread(
    target=send_line_count_periodically,
    args=("U09URTN5NUW", BASE_DIR/"data"/"filtered.txt"),  # Send to this Slack user
    daemon=True
)
report_thread.start()


def open_cmd(data):
    print("open")

    # Remove extra spaces
    
    location = BASE_DIR/"data"/("filtered.txt")
    number = int(data)
    if(number > 20):
        number = 20
    if  not number:
        return
    
    last_lines = pop_last_lines(location, number)
    for line in last_lines:
        # 1) open profile in browser
        
        webbrowser.get('brave').open(f"https://fiverr.com/{line}", autoraise=False)
        time.sleep(1.5)

def pop_last_lines(file_path, n):
    # Read all lines efficiently and keep last n
    with open(file_path, "r") as f:
        lines = f.readlines()  # read all lines

    # Separate last n lines
    last_lines = lines[-n:]
    remaining_lines = lines[:-n]

    # Overwrite the file with remaining lines
    with open(file_path, "w") as f:
        f.writelines(remaining_lines)

    # Return the last n lines
    return [line.strip() for line in last_lines]


# Keep the program running
while True:
    time.sleep(1)