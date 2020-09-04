import Transaction from '../models/Transaction';
import csvParse from 'csv-parse';
import fs from 'fs';
import { In, getRepository, getCustomRepository } from 'typeorm';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    // TODO
    const categoriesRepository = getRepository(Category);
    const contactsReadStream = fs.createReadStream(filePath); // o stream é quem lee
    const parsers = csvParse({
      from_line: 2,
    }); //instancia da csv parse

    const parseCSV = contactsReadStream.pipe(parsers); //pipe lee

    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      categories.push(category);
      transactions.push({ title, type, value, category });
    });
    await new Promise(resolve => parseCSV.on('end', resolve));

    //ver se as categorias existem
    const existentCategories = await categoriesRepository.find({
      where: { title: In(categories) },
    });

    const existenteCategoriesTitles = existentCategories.map(
      category => category.title,
    );

    const addCategoryTitle = categories
      .filter(category => !existenteCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      addCategoryTitle.map(title => ({ title })),
    );

    await categoriesRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existentCategories];

    //SALVAR TRANSACTIONS
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const createdTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );
    await transactionsRepository.save(createdTransactions);

    await fs.promises.unlink(filePath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;