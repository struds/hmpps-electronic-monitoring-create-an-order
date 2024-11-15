import RestClient from '../data/restClient'
import OrderListModel, { OrderList } from '../models/OrderList'
import { AuthenticatedRequestInput } from '../interfaces/request'

export type OrderSearchInput = AuthenticatedRequestInput & {
  searchTerm: string
}

export default class OrderSearchService {
  constructor(private readonly apiClient: RestClient) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async searchOrders(input: OrderSearchInput): Promise<OrderList> {
    const result = await this.apiClient.get({
      path: `/api/orders?searchTerm=${input.searchTerm}`,
      token: input.accessToken,
    })

    return OrderListModel.parse(result)
  }
}
