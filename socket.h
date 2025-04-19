#ifndef SOCKET_H
#define SOCKET_H
#include <WebSocketsServer.h>
#include <Hash.h>
extern WebSocketsServer webSocket;
extern int selector;
void init_socket();
void webSocketEvent(uint8_t num, WStype_t type, uint8_t *payload, size_t length);
#endif
