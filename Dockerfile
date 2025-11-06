FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get install -y libpng-dev libjpeg-dev curl libxi6 build-essential libgl1-mesa-glx && \
    curl -sL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs

FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get install -y libpng-dev libjpeg-dev curl libxi6 build-essential libgl1-mesa-glx && \
    curl -sL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs
WORKDIR /src
COPY ["nuget.config", "."]
COPY ["KGH/KGH.csproj", "KGH/"]
COPY ["KGH.Application/KGH.Application.csproj", "KGH.Application/"]
COPY ["KGH.Domain/KGH.Domain.csproj", "KGH.Domain/"]
COPY ["KGH.Infrastructure/KGH.Infrastructure.csproj", "KGH.Infrastructure/"]
RUN dotnet restore "KGH/KGH.csproj"
COPY . .
WORKDIR "/src/KGH"
RUN dotnet build "KGH.csproj" -c Release -o /app/build

# Node.js build stage
FROM node:14-alpine AS node-build
WORKDIR /ClientApp
COPY KGH/ClientApp/package.json .
COPY KGH/ClientApp/package-lock.json .
RUN npm ci
RUN npm install -g @craco/craco --legacy-peer-deps
RUN npm install -g craco-less --legacy-peer-deps
COPY KGH/ClientApp/ .
RUN npm run build

FROM build AS publish
RUN dotnet publish "KGH.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage for the main application
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
COPY --from=node-build /ClientApp/build ./ClientApp/build

ENTRYPOINT ["dotnet", "KGH.dll"]
