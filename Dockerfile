# Dcokerfile for Short URL Service

FROM enakai00/centos:centos6
MAINTAINER Etsuji Nakai

RUN yum -y install https://dl.fedoraproject.org/pub/epel/6/x86_64/epel-release-6-8.noarch.rpm
RUN yum -y install nodejs nodejs-mysql nodejs-ejs nodejs-express
RUN mkdir /root/app
ADD app /root/app
ADD init.sh /usr/local/bin/init.sh
RUN chmod u+x /usr/local/bin/init.sh

ENV NODE_DBNAME shorturl_service
ENV NODE_DBUSER nodeuser
ENV NODE_DBPASS pas4mysql
ENV NODE_PATH /usr/lib/node_modules

CMD ["/usr/local/bin/init.sh"]
