import { DeleteUser } from '@/application/usecases/user/delete-user'
import { Controller } from '../interfaces'
import { HttpRequest, HttpResponse } from '../../http/interfaces'
import { HttpStatusCode } from '../../http/helper'

type DeleteUserRequestParams = {
  id: string
}

export class DeleteUserController implements Controller {
  constructor(private readonly deleteUser: DeleteUser) {}

  async handle(
    input: HttpRequest<unknown, unknown, DeleteUserRequestParams>
  ): Promise<HttpResponse<unknown>> {
    const { params } = input
    await this.deleteUser.execute({
      userId: params.id,
    })
    return {
      statusCode: HttpStatusCode.NO_CONTENT,
      body: undefined,
    }
  }
}
