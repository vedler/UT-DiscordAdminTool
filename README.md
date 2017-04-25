# UT-DiscordAdminTool

Projekti Wiki leiab siit:

https://github.com/vedler/UT-DiscordAdminTool/wiki

Tühi Node.js projekti põhi saadud siit:

https://github.com/azure-appservice-samples/NodeJS-EmptySiteTemplate

Live lehe, mis kasutab master branchi leiab siit:

http://ut-discordadmintool.azurewebsites.net/

Kui mingil põhjusel kood tööle ei lähe, siis tasub kõigepealt teha projektikaustas käsurealt:


1) Administraatoriõigustega (Run as admin) käsurealt ükskõik kust (pärast commandide jooksutamist restart arvutile):

```npm install --global --production windows-build-tools```

```npm install -g node-gyp```

2) Projekti kaustast käsurealt:

```npm install```

```node setup\create_database.js```
