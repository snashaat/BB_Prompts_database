# Unraid Installation Guide

This guide provides step-by-step instructions for installing the Prompt Management Platform on your Unraid server using the Community Applications plugin.

## Step 1: Install Community Applications

If you haven't already, install the **Community Applications** plugin on your Unraid server. You can find instructions on the [official Unraid forums](https://forums.unraid.net/topic/38582-plug-in-community-applications/).

## Step 2: Add the Application Template

1.  Go to the **Apps** tab in your Unraid web interface.
2.  In the search box, look for **Prompt Management Platform**.
    *Note: For this to work, the template needs to be submitted and accepted into the official Community Applications repository. As a manual alternative, you can add the template's repository URL directly.*
3.  Click the **Install** button.

## Step 3: Configure the Container

You will be presented with a configuration screen. Here are the key settings:

-   **WebUI Port:** The default port is `3000`. You can change this if it conflicts with another service.
-   **Database Path:** This is the path on your Unraid server where the application's database will be stored. It's recommended to use a path on your cache drive for better performance (e.g., `/mnt/cache/appdata/prompt-management-platform/database`).
-   **Uploads Path:** This is where user-uploaded images will be stored.
-   **Thumbnails Path:** This is where generated thumbnails will be stored.
-   **JWT_SECRET:** **This is a critical security setting.** You must change this to a long, random, and unique string. You can use a password generator to create a strong secret.

## Step 4: Start the Container

Once you've configured the settings, click **Apply** to start the Docker container. Unraid will pull the Docker image and start the application.

## Step 5: Access the WebUI

You can access the application by navigating to your Unraid server's IP address and the port you configured (e.g., `http://192.168.1.100:3000`).

## Reverse Proxy Configuration (Optional but Recommended)

For secure, external access, it's highly recommended to use a reverse proxy like **Nginx Proxy Manager** or **SWAG**.

Here is a sample configuration for Nginx Proxy Manager:

1.  **Domain Name:** `prompts.your-domain.com`
2.  **Scheme:** `http`
3.  **Forward Hostname / IP:** Your Unraid server's IP address.
4.  **Forward Port:** The port you configured for the WebUI (e.g., `3000`).
5.  **Enable `Websockets Support`**.
6.  **Enable `Block Common Exploits`**.
7.  **SSL:** It's highly recommended to set up an SSL certificate (e.g., using Let's Encrypt).

## Backups

It is crucial to back up your application data regularly. The following paths contain all of your persistent data:

-   The **Database Path** you configured.
-   The **Uploads Path** you configured.
-   The **Thumbnails Path** you configured.

You can use the **CA Appdata Backup / Restore v2** plugin in Unraid to automate backups of these directories.

## Updating the Application

When a new version of the application is released, you can update it from the **Apps** tab in Unraid. Simply click the **Check for Updates** button, and if an update is available, you can apply it.
