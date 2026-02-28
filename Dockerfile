# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution and project files for layer caching
COPY CosmetologyBooking.slnx ./
COPY backend/Domain/CosmetologyBooking.Domain.csproj backend/Domain/
COPY backend/Application/CosmetologyBooking.Application.csproj backend/Application/
COPY backend/Infrastructure/CosmetologyBooking.Infrastructure.csproj backend/Infrastructure/
COPY backend/API/CosmetologyBooking.API.csproj backend/API/

# Restore dependencies
RUN dotnet restore backend/API/CosmetologyBooking.API.csproj

# Copy all source files
COPY backend/ backend/

# Build and publish the API
RUN dotnet publish backend/API/CosmetologyBooking.API.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Create a non-root user for security
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

# Copy published output from build stage
COPY --from=build /app/publish .

# Expose the application port
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "CosmetologyBooking.API.dll"]
