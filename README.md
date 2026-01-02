# Run
- add the console user to the redpanda service once (or on every startup if not usinga volume for /data):
    `rpk security user create <user> -p "<password>" --mechanism SCRAM-SHA-256`
    - credentials must match "redpanda.console-config.yaml" file
- add missing oidc credentials to .env file
- create rsa keypair: `openssl genrsa -out private.key.pem 2048`
    - extract public key: `openssl rsa -in private.key.pem -outform PEM -pubout -out public.key.pem`
- java 25
- node 24

# Permissions / ACLs
- General auth: https://docs.redpanda.com/current/manage/security/authentication/#oidc
- Console authentication: https://docs.redpanda.com/current/console/config/security/authentication
- Console authorization: https://docs.redpanda.com/current/console/config/security/authorization/
- Acls: 
    - https://docs.redpanda.com/current/manage/security/authorization/acl/
    - https://docs.redpanda.com/current/reference/rpk/rpk-security/rpk-security-acl/

## topic
- Give a user permission to all operations on topics:
```
rpk security acl create --operation all --topic=* --allow-principal=<principal-name> \
-X user=<super-user> \
-X pass=<super-user-password> \
-X sasl.mechanism=SCRAM-SHA-256
```
- Give all users permission to read, write and describe any topic:
```
rpk security acl create --operation read,write,describe,create --topic=* --allow-principal=* \
-X user=<super-user> \
-X pass=<super-user-password> \
-X sasl.mechanism=SCRAM-SHA-256
```

## groups
- Give all users permission to some operations for any group:
```
rpk security acl create --operation describe,read,create,write --group=* --allow-principal='*'
-X user=<super-user> \
-X pass=<super-user-password> \
-X sasl.mechanism=SCRAM-SHA-256
```

## cluster
- Not sure what exactly this is, but it grants admin users access to ACLs management for console
```
rpk security acl create --operation all --cluster --allow-principal=<principal-name> \
-X user=<super-user> \
-X pass=<super-user-password> \
-X sasl.mechanism=SCRAM-SHA-256
```

# Docs
- https://docs.redpanda.com/api/doc/http-proxy/
- Redpanda endpoints: https://docs.redpanda.com/api/doc/http-proxy/operation/operation-get_consumer_offsets
- proxy client: https://docs.redpanda.com/current/reference/properties/broker-properties/#http-proxy-client