# The Mode Collection Micro-Service

This micro-service is designed to manage ratings and reviews through an API. It utilizes a PostgreSQL database hosted on a Docker container, running on an AWS EC2 instance. To ensure scalability and performance, we've deployed multiple Node-Express servers on separate EC2 instances and employed Nginx for load balancing.

## Performance Overview

**Stress Testing Results:**

inital stress test before optimizations
- version 0: ![Stress Test Result](<./readme-images/v0.png>)

- after optimizations
- version 3: ![Stress Test Result](<./readme-images/v3.PNG>)

## Optimizations & Their Impact

1. **Database Indexing:**
   - **Problem:** Initial database response times were around 45 seconds.
   - **Solution:** Added relevant indexes to the database.
   - **Result:** Reduced the database response times to 2 seconds.

2. **Database Connection Management:**
   - **Problem:** Creating a new database connection for each API request was inefficient and led to high error rates.
   - **Solution:** Established a single database connection and reused it for each API request.
   - **Result:** This drastically improved performance. The error rate dropped from 100% to 0%. Furthermore, when tested with 1,000 users per second over a minute, the average response time decreased from 10,000ms to 2,600ms.

3. **Load Balancing with Nginx:**
   - **Problem:** Even with optimized database connections, the response time was 2,600ms.
   - **Solution:** Integrated Nginx for load balancing across multiple Node-Express servers.
   - **Result:** This strategy further reduced the average response time to 25ms.
