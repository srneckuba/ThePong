from flask import *
import sys
from datetime import datetime
import base64, hashlib
from cryptography.fernet import Fernet
from bs4 import BeautifulSoup
import time
if sys.argv[1] == ("--help" or "-h"):
    print("python3 thepong.py [local_server_adress] [publick_server_adress] [messages_file] [encryption_password]")
    exit()

local_server_adress = sys.argv[1]
publick_server_adress = sys.argv[2]
messages_file = sys.argv[3]
encryption_password = sys.argv[4]

class encryption():
    def __init__(self, password):
        self.enc = Fernet(base64.urlsafe_b64encode(hashlib.md5(password.encode("utf-8")).hexdigest().encode("utf-8")))
    def encrypt(self, message):
        return self.enc.encrypt(message.encode("utf-8"))
    def decrypt(self, message):
        return self.enc.decrypt(message)

last_access = {}
app = Flask(__name__)
enc = encryption(encryption_password)

@app.route("/", methods=["GET", "POST"])
def main():
    if request.method == "GET":
        if request.args.get("arguments") == None:
            return render_template("index.html", testmessage=enc.encrypt("testmessage").decode("utf-8"), ip=publick_server_adress, date_time=datetime.now().strftime("%d/%m/%Y %H:%M:%S"))
        elif request.args.get("arguments") != None:
            try:
                args = enc.decrypt(request.args.get("arguments").encode("utf-8")).decode("utf-8")
            except:
                return  abort(401, 'Invalid key')
            args = args.split(";")
            args_parsed = {}
            print(args)
            for arg in args:
                args_parsed[arg.split("=")[0]] = arg.split("=")[1]
            if args_parsed["username"] == "" or args_parsed["username"] == None:
                return  abort(400, 'Invalid request (No username)')
            elif args_parsed["action"] == "" or args_parsed["action"] == None:
                return  abort(400, 'Invalid request (No action)')
            else:
                if args_parsed["action"] == "recheck":
                    if int(len(args_parsed["username"])) > 20:
                        return abort(400, "Invalid request (Username to long)")
                    if args_parsed["client_message_list_lenght"] == None:
                        return abort(400, "Invalid request (No messages list lenght)")
                    if args_parsed["client_users_list_lenght"] == None:
                        return abort(400, "Invalid request (No users list lenght)")
                    last_access[args_parsed["username"]] = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
                    def GetCurrentUsers(last_access):
                        users_list = []
                        for access in last_access.keys():
                            if last_access[access].split(" ")[0] in datetime.now().strftime("%d/%m/%Y %H:%M:%S"):
                                current_time = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
                                access_hours = int(last_access[access].split(" ")[1].split(":")[0])
                                access_minutes = int(last_access[access].split(" ")[1].split(":")[1]) + access_hours * 60
                                access_seconds = int(last_access[access].split(" ")[1].split(":")[2]) + access_minutes * 60
                                current_hours = int(current_time.split(" ")[1].split(":")[0])
                                current_minutes = int(current_time.split(" ")[1].split(":")[1]) + current_hours * 60
                                current_seconds = int(current_time.split(" ")[1].split(":")[2]) + current_minutes * 60
                                if (current_seconds - access_seconds) <= 30:
                                    users_list.append(access)
                        return users_list
                    GetCurrentUsers(last_access)
                    users_xml = "<users>"
                    for user in users_list:
                        users_xml = users_xml + "<user>" + user + "</user>"
                    users_xml = users_xml + "</users>"

                    i = 0
                    status_xml = "<status><time>" + datetime.now().strftime("%d/%m/%Y %H:%M:%S") + "</time></status>"
                    while (len(BeautifulSoup(open(messages_file, "r").read(), "lxml").find_all("message")) == int(args_parsed["client_message_list_lenght"]) and (len(user_list) == args_parsed["client_users_list_lenght"])):
                        status_xml = "<status><time>" + datetime.now().strftime("%d/%m/%Y %H:%M:%S") + "</time></status>"
                        if i == 10:
                            return enc.encrypt("<data><messages>" + open(messages_file, "r").read() + "</messages>" + users_xml + status_xml + "</data>")
                        else:
                            i = i + 0.5
                            time.sleep(0.5)
                    status_xml = "<status><time>" + datetime.now().strftime("%d/%m/%Y %H:%M:%S") + "</time></status>"
                    return enc.encrypt("<data><messages>" + open(messages_file, "r").read() + "</messages>" + users_xml + status_xml + "</data>")
                elif args_parsed["action"] == "send_message":
                    if (int(len(args_parsed["username"])) > 20) or (int(len(args_parsed["message"])) > 500):
                        return abort(400, "Invalid request")
                    if args_parsed["message"] != None:
                        messages_xml = open(messages_file, "a")
                        messages_xml.write("<message><time>" + datetime.now().strftime("%d/%m/%Y %H:%M:%S") + "</time><user>" + args_parsed["username"] + "</user><text>" + args_parsed["message"] + "</text></message>")
                        return "ok"
                    else:
                        return abort(400, 'Invalid request')
if __name__ == '__main__':
    app.run(host=local_server_adress, debug=False, port="80")
