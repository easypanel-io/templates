# KitchenOwl

A self-hosted grocery list and recipe manager designed to help you organize your
kitchen and meal planning.

## Features

- **Grocery List Management**: Create and manage shopping lists with categories
  and quantities
- **Recipe Organization**: Store recipes with ingredients, instructions, and
  nutritional information
- **Meal Planning**: Plan meals and automatically generate shopping lists
- **Family Collaboration**: Share lists and recipes with family members
- **Inventory Tracking**: Track pantry inventory and get cooking suggestions
- **Web Interface**: Clean, responsive interface accessible from any device

## Architecture

KitchenOwl consists of two main components:

1. **Backend Service**: Handles data storage, API endpoints, and business logic
2. **Frontend Service**: Provides the web interface and user experience

## Configuration

- **App Service Name**: Base name for all KitchenOwl services
- **Frontend Image**: Docker image for the web interface
- **Backend Image**: Docker image for the API and data management
- **JWT Secret Key**: Secret key for authentication (auto-generated if not
  provided)

## Services

### Backend Service

- Runs the KitchenOwl API server
- Stores all data in persistent volume (`kitchenowl-data`)
- Handles authentication with JWT tokens
- Provides REST API for frontend communication

### Frontend Service

- Serves the web interface accessible at your domain
- Connects to backend service for data operations
- Provides responsive design for desktop and mobile
- Handles user interactions and data visualization

## Usage

1. Deploy the template with your desired configuration
2. Access the web interface at your domain
3. Create your first grocery list or add recipes
4. Start planning meals and managing your kitchen inventory
5. Share with family members for collaborative meal planning

## Data Storage

- All KitchenOwl data is stored in a persistent volume
- Data includes recipes, shopping lists, inventory, and user preferences
- Data persists across container restarts and updates
- No external database required

## Security

- JWT-based authentication system
- Secure communication between frontend and backend
- All data stored locally in your infrastructure
- No external data sharing or cloud dependencies

## Family Features

- Share grocery lists with family members
- Collaborative meal planning
- Recipe sharing and organization
- Inventory management for household items
- Multi-user support with individual preferences

## Mobile Support

- Responsive web interface works on all devices
- Touch-friendly interface for mobile shopping
- Offline capability for viewing lists
- Easy sharing of lists and recipes
