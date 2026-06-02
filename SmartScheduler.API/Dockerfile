# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY SmartScheduler.API.csproj .
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 \
  CMD curl -f http://localhost:5000/api/health || exit 1

ENTRYPOINT ["dotnet", "SmartScheduler.API.dll"]
