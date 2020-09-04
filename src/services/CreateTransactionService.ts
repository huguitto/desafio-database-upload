// import AppError from '../errors/AppError';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
import Transaction from '../models/Transaction';
import { getCustomRepository, getRepository } from 'typeorm';
import TransactionRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';
import Category from '../models/Category';

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    // TODO
    const transactionRepository = getCustomRepository(TransactionRepository);

    //Verificamos se a categoria existe e se nao a gente cria ela e ja passa o id dela para nossa transacao
    const categoryRepository = getRepository(Category);

    let transactionCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!transactionCategory) {
      //cria uma categoria
      transactionCategory = categoryRepository.create({ title: category });

      await categoryRepository.save(transactionCategory);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: transactionCategory,
    });

    //comporbar si o balance é válido
    const { total } = await transactionRepository.getBalance();
    if (transaction.type === 'outcome' && transaction.value > total) {
      throw new AppError('Operation denegated, not enough money available.');
    }
    //save on the database
    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
