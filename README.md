# The-Mode-Collection-Micro-Service
Ratings and reviews api
postgres database on a docker container on an aws ec2 instance
multiple node-express servers on ec2 instances using nginx to load balance

brief over view on performance 
  <stress test screen shots for each route>
  <stress test screen shots for each route>
  <stress test screen shots for each route>
  <stress test screen shots for each route>
  
  what optimizations i made and what difference they made
    adding indexes brought my database response times down from 45seconds to 2 seconds
    instead of creating a database connection inside each api route, I created 1 connection and reused it for each route
      this increased performance tremendiously, 
        it brought the error rate down from 100% to 0% and also brought the average reponse time down to 2600ms from 10000ms when tested at 1000 users per second for a minute
    using nginx to add load balancing did a further big performance increase from 2600ms to 25ms 
