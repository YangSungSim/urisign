import express, { Router } from 'express';
import session from 'express-session';
import { Controller } from './common/interfaces/controller.interface';
import { verifyJWT } from './middlewares/auth.middleware';
import { csrf } from './middlewares/csrf.middleware';
import { errorMiddleware } from './middlewares/error.middleware';

class App {
  private app: express.Application;

  constructor(controllers: Controller[]) {
    this.app = express();

    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
  }

  public listen() {
    const port = process.env.PORT ?? 3000;
    this.app.listen(port, () => {
      console.log(`App listening on the port ${port}`);
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(express.json());
    this.app.use(
      session({
        name: 'prgrms.sid',
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true,
      }),
    );
    this.app.use(csrf());
    this.app.use(verifyJWT);
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private initializeControllers(controllers: Controller[]) {
    const router = Router();

    router.get('/', (req, res) => res.send('OK'));

    controllers.forEach((controller) => {
      router.use(controller.router);
    });

    this.app.use('/api', router);
  }
}

export default App;
