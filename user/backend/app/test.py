import numpy as np


def get_column_vector_from_sparse(i_idx, j_idx, smat,
                                  rows_start, rows_end,
                                  column):
    # [:0, 0]
    if rows_end < rows_start:
        return np.zeros(0)

    v_out = np.zeros(rows_end - rows_start)
    idx_counter = 0
    while idx_counter < smat.size:
        if j_idx[idx_counter] == column and \
                rows_start <= i_idx[idx_counter] <= rows_end:
            v_out[i_idx[idx_counter]] = smat[idx_counter]
        idx_counter += 1
    return v_out


def compute_incomplete_cholesky_factorization(i_idx, j_idx, smat):
    ### неполноное разлодение Холецкого
    ### алгоритм аналогичен классическому разложению Холецкого
    # lmat = np.zeros(smat.shape) ### ниждентреугольная матрица
    # nx = smat.shape[0]
    # for idx in range(nx):
    #     ### compute diagonal element
    #     prod = np.dot(lmat[:idx, idx], lmat[:idx, idx])
    #     lmat[idx, idx] = np.sqrt(smat[idx, idx] - prod)
    #     ### compute off-diagonal element
    #     if idx > 0:
    #         lmat[idx, idx - 1] = smat[idx, idx - 1] / lmat[idx - 1, idx - 1]
    # return lmat

    # Приведено
    lmat_i_idx = np.zeros((smat.shape), dtype=np.int64)
    lmat_j_idx = np.zeros((smat.shape), dtype=np.int64)
    lmat = np.zeros(smat.shape)  ### ниждентреугольная матрица
    # smat.shape[0] = 4 + 3 * (nx - 2)
    nx = int((smat.shape[0] - 4) / 3 + 2)
    for idx in range(nx):
        ### compute diagonal element
        column_vector = get_column_vector_from_sparse(lmat_i_idx, lmat_j_idx,
                                                      lmat,
                                                      0, idx - 1,
                                                      idx)
        prod = np.dot(column_vector, column_vector)
        lmat[idx] = np.sqrt(smat[idx] - prod)
        lmat_i_idx[idx] = idx
        lmat_j_idx[idx] = idx
        ### compute off-diagonal element
        if idx > 0:
            smat_el = 0  # = smat[idx, idx - 1]
            smat_idx = 0
            while smat_idx < smat.size:
                if i_idx[smat_idx] == idx and j_idx[smat_idx] == idx - 1:
                    smat_el = smat[smat_idx]
                    break
                smat_idx += 1

            lmat_i_idx[idx + nx] = idx
            lmat_j_idx[idx + nx] = idx - 1
            lmat[idx + nx] = smat_el / lmat[idx - 1]
            # lmat[idx, idx - 1] = smat[idx, idx - 1] / lmat[idx - 1, idx - 1]
    return (lmat_i_idx, lmat_j_idx, lmat)


def init_system_matrix_1d_problem(nx, nt):
    ### инициализация матрицы системы линейных уравнений
    ### матрица системы тридиагональна
    ### НЕОБХОДИМО ПРИВЕСТИ К ФОРМАТУ РАЗРЕЖЕННЫХ МАТРИЦ
    # Приведено

    dt = 1.0 / nt
    dx = 1.0 / nx

    # по 3 элемента на каждой строке кроме первой и последней, на них по 2
    # 2 + 3 * (nx - 2) + 2
    n_elem = 4 + 3 * (nx - 2)

    i_idx = np.zeros((n_elem), dtype=np.int64)
    j_idx = np.zeros((n_elem), dtype=np.int64)
    smat = np.zeros(n_elem)

    ### diagonal elements
    i_idx[0] = 0
    j_idx[0] = 0
    smat[0] = 1.0 + 0.5 * dt / dx / dx
    for idx in range(1, nx - 1):
        i_idx[idx] = idx
        j_idx[idx] = idx
        smat[idx] = 1.0 + 1.0 * dt / dx / dx
    i_idx[nx - 1] = nx - 1
    j_idx[nx - 1] = nx - 1
    smat[nx - 1] = 1.0 + 0.5 * dt / dx / dx

    ### off-diagonal elements
    side_diagonal_position = 0
    # записываем по 2 элемента за итерацию
    for idx in range(nx, n_elem - 1, 2):
        i_idx[idx] = side_diagonal_position
        j_idx[idx] = side_diagonal_position + 1
        # smat[idx, idx + 1] = - 0.5 * dt / dx / dx
        smat[idx] = - 0.5 * dt / dx / dx

        i_idx[idx + 1] = side_diagonal_position + 1
        j_idx[idx + 1] = side_diagonal_position
        smat[idx + 1] = - 0.5 * dt / dx / dx
        # smat[idx + 1, idx] = - 0.5 * dt / dx / dx

        side_diagonal_position += 1

    return i_idx, j_idx, smat


### conjugate gradient method (cgd)
def init_gd_prec(smat_idx, smat_jdx, smat, lmat_idx, lmat_jdx, lmat, bvec):
    ### инициализация метода наискорейшего спуска с предобуславливанием
    ### НЕОБХОДИМО ПРИВЕСТИ К ФОРМАТУ РАЗРЕЖЕННЫХ МАТРИЦ
    # x0 = np.zeros(bvec.shape)
    # r0 = bvec - np.dot(smat, x0)
    # d0 = r0.copy()
    # d0 = solve_u_system(np.transpose(lmat), d0)
    # d0 = solve_l_system(lmat, d0)
    # return (x0, r0, d0)

    # Приведено
    x0 = np.zeros(bvec.shape)
    r0 = bvec - compute_sparse_matrix_vector_product(smat_idx, smat_jdx, smat,
                                                     x0)
    d0 = r0.copy()
    d0 = solve_u_system(lmat_jdx, lmat_idx, lmat, d0)
    d0 = solve_l_system(lmat_idx, lmat_jdx, lmat, d0)
    return (x0, r0, d0)


def single_step_gd_prec(smat_idx, smat_jdx, smat, lmat_idx, lmat_jdx, lmat,
                        x0, r0, d0):
    ### одна итерация по методу наискорейшего спуска с предобуславливанием
    ### НЕОБХОДИМО ПРИВЕСТИ К ФОРМАТУ РАЗРЕЖЕННЫХ МАТРИЦ
    # eps = 1.0e-10
    # v0 = np.dot(smat, d0)
    # alpha = np.dot(r0, d0) / max(eps, np.dot(d0, v0))
    # x1 = x0 + alpha * d0
    # r1 = r0 - alpha * v0
    # d1 = solve_u_system(np.transpose(lmat), r1)
    # d1 = solve_l_system(lmat, d1)

    # Приведено
    eps = 1.0e-10
    v0 = compute_sparse_matrix_vector_product(smat_idx, smat_jdx, smat, d0)
    alpha = np.dot(r0, d0) / max(eps, np.dot(d0, v0))
    x1 = x0 + alpha * d0
    r1 = r0 - alpha * v0
    d1 = solve_u_system(lmat_jdx, lmat_idx, lmat, r1)
    d1 = solve_l_system(lmat_idx, lmat_jdx, lmat, d1)

    return (x1, r1, d1)


def compute_solution_gd_prec(smat_idx, smat_jdx, smat,
                             lmat_idx, lmat_jdx, lmat,
                             bvec, niter):
    ### решение системы линейных уравнений методом наискорейшего спуска
    ### с предобуславливанием
    ### НЕОБХОДИМО ПРИВЕСТИ К ФОРМАТУ РАЗРЕЖЕННЫХ МАТРИЦ

    # Приведено
    x0, r0, d0 = init_gd_prec(smat_idx, smat_jdx, smat,
                              lmat_idx, lmat_jdx, lmat,
                              bvec)
    res = np.zeros((niter + 1))
    for kiter in range(niter):
        res[kiter] = np.sqrt(np.dot(r0, r0))
        x1, r1, d1 = single_step_gd_prec(smat_idx, smat_jdx, smat,
                                         lmat_idx, lmat_jdx, lmat,
                                         x0, r0, d0)
        x0 = x1.copy()
        r0 = r1.copy()
        d0 = d1.copy()
    res[niter] = np.sqrt(np.dot(r0, r0))
    return (x0, r0, res)


def init_right_part(nx):
    ### инициализация правой части
    xnode = np.linspace(0.5 / nx, 1.0 - 0.5 / nx, nx)
    b = 0.2 + 1.6 * np.cos(2.0 * np.pi * xnode) - 0.2 * np.sin(1.0 * np.pi * xnode)
    return b


def get_row_vector_from_sparse(i_idx, j_idx, smat, row,
                               columns_start, columns_end):
    # [0, :0]
    if columns_end < columns_start:
        return np.zeros(0)

    v_out = np.zeros(columns_end - columns_start + 1)
    idx_counter = 0
    while idx_counter < smat.size:
        if i_idx[idx_counter] == row and \
                columns_start <= j_idx[idx_counter] <= columns_end:
            v_out[j_idx[idx_counter] - columns_start] = smat[idx_counter]
        idx_counter += 1
    return v_out


def solve_l_system(i_idx, j_idx, lmat, bvec):
    ### решение системы линейных уравнений с нижнетреугольной матрицей
    ### НЕОБХОДИМО ПРИВЕСТИ К ФОРМАТУ РАЗРЕЖЕННЫХ МАТРИЦ
    # nx = bvec.size
    # x = np.zeros((nx))
    # x[0] = bvec[0] / lmat[0, 0]
    # for idx in range(1, nx):
    #     x[idx] = (bvec[idx] - np.dot(lmat[idx, :idx], x[: idx])) / lmat[idx, idx]
    # return x

    # Приведено
    nx = bvec.size
    x = np.zeros((nx))
    x[0] = bvec[0] / lmat[0]
    for idx in range(1, nx):
        lmat_vector = get_row_vector_from_sparse(i_idx, j_idx, lmat, idx,
                                                 0, idx - 1)
        x[idx] = (bvec[idx] - np.dot(lmat_vector, x[: idx])) / lmat[idx]
    return x


def solve_u_system(i_idx, j_idx, umat, bvec):
    ### решение системы линейных уравнений с верхнетреугольной матрицей
    ### НЕОБХОДИМО ПРИВЕСТИ К ФОРМАТУ РАЗРЕЖЕННЫХ МАТРИЦ
    # nx = bvec.size
    # x = np.zeros((nx))
    # x[nx - 1] = bvec[nx - 1] / umat[nx - 1, nx - 1]
    # for idx in range(1, nx):
    #     j = nx - 1 - idx
    #     x[j] = (bvec[j] - np.dot(umat[j, (j + 1):], x[(j + 1):])) / umat[j, j]
    # return x

    # Приведено
    nx = bvec.size
    x = np.zeros((nx))
    x[nx - 1] = bvec[nx - 1] / umat[nx - 1]
    for idx in range(1, nx):
        j = nx - 1 - idx
        umat_vector = get_row_vector_from_sparse(i_idx, j_idx, umat, j,
                                                 j + 1, nx - 1)
        x[j] = (bvec[j] - np.dot(umat_vector, x[(j + 1):])) / umat[j]
    return x


def compute_sparse_matrix_vector_product(i_idx, j_idx, m_val, v_val):
    v_out = np.zeros(v_val.size)
    n_elem = m_val.size
    for idx_counter in range(n_elem):
        v_out[i_idx[idx_counter]] += m_val[idx_counter] * v_val[j_idx[idx_counter]]
    return v_out


print('test_problem_2')
nx = 2  ### размерность пространства
nt = 600  ### параметр, контролирующий вид матрицы системы линейных уравнений
niter = 60  ### число итераций по методу наискорейшего спуска
### инициализация системы линеййных уравнений
smat_idx, smat_jdx, smat = init_system_matrix_1d_problem(nx, nt)
### выичление нижнетреуголбной матрицы для предобуславливания
lmat_idx, lmat_jdx, lmat = compute_incomplete_cholesky_factorization(smat_idx, smat_jdx, smat)
bvec = init_right_part(nx)

u, r, res_prec = compute_solution_gd_prec(smat_idx, smat_jdx, smat,
                                          lmat_idx, lmat_jdx, lmat,
                                          bvec, niter)
