FROM ubuntu:latest

RUN apt update && apt install  openssh-server -y

COPY ./sshd_config /etc/ssh/sshd_config
RUN groupadd sftpusers

RUN mkdir /sftp
RUN chown  :sftpusers /sftp

RUN useradd -g sftpusers -d /home/sftp -s /sbin/nologin sftp
RUN  echo 'sftp:sftp' | chpasswd

RUN useradd -g sftpusers -s /sbin/nologin sftpreader
RUN  echo 'sftpreader:sftpreader' | chpasswd

RUN useradd -rm -d /home/admin -s /bin/bash admin 
RUN  echo 'admin:admin' | chpasswd


RUN service ssh start

EXPOSE 22

CMD ["/usr/sbin/sshd","-D"]