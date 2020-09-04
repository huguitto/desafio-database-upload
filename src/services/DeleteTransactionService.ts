// import AppError from '../errors/AppError';
import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';
class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    // TODO
    const transactionRepository = getRepository(Transaction);

    const transactionToDelete = await transactionRepository.findOne(id);

    //SI existe deletamos
    if (!transactionToDelete) {
      throw new AppError('Transaction not match');
    }

    await transactionRepository.remove(transactionToDelete);

    return;
  }
}

export default DeleteTransactionService;
