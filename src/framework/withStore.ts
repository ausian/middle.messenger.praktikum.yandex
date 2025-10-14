import Block, { type BlockProps } from './Block.ts';
import store, { StoreEvents, type AppState } from './Store.ts';
import isEqual from '../utils/isEqual.ts';

type MapStateToProps<TMappedProps extends Record<string, unknown>> = (
  state: AppState,
) => TMappedProps;

type BlockClass<TProps extends BlockProps> = new (
  ...args: any[]
) => Block<TProps>;

export const withStore = <
  TMappedProps extends Record<string, unknown>,
  TBaseProps extends BlockProps = BlockProps,
>(
  mapStateToProps: MapStateToProps<TMappedProps>,
) => {
  return <TComponent extends BlockClass<TBaseProps & TMappedProps>>(
    Component: TComponent,
  ) => {
    return class WithStore extends Component {
      private stateProps: TMappedProps;

      constructor(...args: any[]) {
        super(...args);
        const mapped = mapStateToProps(store.getState());
        this.stateProps = mapped;
        this.setProps({ ...mapped } as Partial<TBaseProps & TMappedProps>);
      }

      override componentDidMount(): void {
        store.on(StoreEvents.Updated, this.handleStoreUpdate);
        super.componentDidMount();
      }

      private handleStoreUpdate = (): void => {
        const newStateProps = mapStateToProps(store.getState());

        if (isEqual(this.stateProps, newStateProps)) return;

        this.stateProps = newStateProps;
        this.setProps({ ...newStateProps } as Partial<
          TBaseProps & TMappedProps
        >);
      };
    };
  };
};

export default withStore;
