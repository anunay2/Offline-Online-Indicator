Offline-online indicator 
===

## Server side

#### DB

We want a simple key-value store DB.So , mongoDB comes first on our mind.

| user-id | last-online |
|---------|-------------|
| userId1 | epoch1      |
| userId2 | epoch2      |
| userId3 | epoch3      |


Here we are storing time in terms of epoch to make arithmetic operation on 
epoch efficient.This would come handy later.

Assuming each entry takes 4 + 4 = 8 byte of data.
Considering earth population 8 billion users.

Total size of the DB required : (8 B * 8 byte = 64 * 10^9) = 64 GB

One DB instance can hold the data , but can't handle the load.We may have to use data partition .

Here we would update the last-online column to the current epoch when we get a heartBeat by the user.

Apis exposed over the server.

/status/{userId} : shows if the user is online or if offline it shows last time seen.

/getAllUser : shows up all the users online first and then offline users.


## Client side

To simulate the user we would be using socketIO to send heartBeat messages in random intervals for random users.





