# ThePong
- easy to use web-browser chat application
## Features
- low data usage
- showing active users 
- fast message delivery 
- whole communication is encrypted using Fernet symmetric encryption
- all messages are saved in one file
- responsive design
## Installation
- clone repository
```
git clone https://github.com/srneckuba/ThePong.git
```
- enter cloned repository
```
cd ThePong/
```
- install python3 and pip3
```
apt-get install python3 python3-pip
```
- install requirements
```
pip3 install -r requirements.txt
```
## Starting server
- help 
```
python3 thepong.py [local_server_adress] [publick_server_adress] [messages_file] [encryption_password]
```
- example 
```
python3 thepong.py 127.0.0.1 127.0.0.1 messages.xml example1
```
## Using
- open http://publick_server_adress/ in browser. With example value http://127.0.0.1/.
- enter any username and encryption_password. With example value "example1" is encryption password 
- if encryption password is correct you should see messages, active users, and message input
- you should see your username in active users after 10 seconds
